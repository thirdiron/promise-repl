#!/usr/bin/env node

var repl = require('repl'),
  util = require('util').
  q = require('q'),
  uglifyJS = require('uglify-js'),
  _ = require('underscore');
 
var replServer = repl.start({});
function nodeIsRequireCall(node) {
  return ((node instanceof uglifyJS.AST_Call) && node.expression && 
          node.expression.start && node.expression.start.value === 'require');
}

var foo = {};
var defaultEval = replServer.eval;
replServer.eval = function(cmd, context, filename, callback) {
  var requireFound = false;
  if (cmd.match(/require/)) {  // Only bother parsing if we see "require"
    cmd = cmd.substring(1, cmd.length - 1);
    console.log(cmd);
    var ast = uglifyJS.parse(cmd);
    var requireFound;
    var childrenBefore;
    var walker = new uglifyJS.TreeWalker(function(node) {
      if (nodeIsRequireCall(node)) {
        requireFound = true;
      }
    });
    ast.walk(walker);

    if (requireFound) {
      childrenBefore = _.pluck(context.module.children, 'id');
    }
    //console.log(require('util').inspect(ast));

  }
  foo.context = context;
  foo.filename = filename;
  defaultEval(cmd, context, filename, function(err, result) {
    foo.module = module;
    if (requireFound) {
      //console.log(require('util').inspect(context.module.children));
      var newModules = _.difference(_.pluck(context.module.children, 'id'), childrenBefore);
      newModules.forEach(function(x) {
        var modulePath = x;
        require('fs').watchFile(modulePath, function(curr, prev) {
          if (curr.mtime != prev.mtime) {
            // module changed, dump it and its children from the require cache
            console.log('Module change deteted, clearing cache!');
            clearModule(modulePath);
          }
        });
      });
    }
    if (err || !result) return callback(err, result);

    if (result.then && result.catch) {
      result.then(function(promiseResult) {
        callback(null, ['[Promise]', promiseResult]);
      }).catch(function(err) {
        callback(err);
      });
    } else if (result.then && result.fail) {
      result.then(function(promiseResult) {
        callback(null, ['[Promise]', promiseResult]);
      }).catch(function(Err) {
        callback(err);
      });
    } else if (result.then) {
      result.then(function(promiseResult) {
        callback(null, ['[Promise]', promiseResult]);
      });
    } else {
      // Not a thenable, just call the callback.
      callback(err, result);
    }

  });
};


function clearModule(modulePath) {
  function clearModuleInner(modulePath, moduleNode) {
    if (moduleNode.id === modulePath) {
      var modulePathsToClear = getModulePaths(moduleNode, []);
      modulePathsToClear.forEach(function(modulePathToClear) {
        require.cache[modulePathToClear] = undefined;
      });
    }
    for (var i=0;i<moduleNode.children.length;i++) {
      clearModuleInner(modulePath, moduleNode.children[i]);
    }
  }
  return clearModuleInner(modulePath, foo.context.module);
}


function getModulePaths(moduleNode, memo) {
  memo.push(moduleNode.filename);
  for (var j=0;j<moduleNode.children.length;j++) {
    memo = getModulePaths(moduleNode.children[j], memo);
  }
  return memo;
}

replServer.context.getCachedPaths = function(moduleNode) {

  if (moduleNode) return getModulePaths(moduleNode, []);

  var paths = [];
  for(var i=0;i<foo.context.module.children.length;i++) {
    paths = getModulePaths(foo.context.module.children[i], paths);
  }

  return paths;
};





replServer.context.getModule = function() {
  return foo.context.module;
};

replServer.context.bar = function() {
  var Q = require('q');
  var deferred = Q.defer();
  var util = require('util');
  console.log(util.inspect(foo));
  defaultEval("require('./getModule.js');", foo.context, foo.filename, function(err, result) {
    if (err) return deferred.reject(err);
    return deferred.resolve(result);
  });
  return deferred.promise;
};
replServer.context.getChildren = function() {
  console.log(util.inspect(module.children));
};
replServer.context.test = foo;

