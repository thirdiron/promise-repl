#!/usr/bin/env node

var repl = require('repl'),
  util = require('util');
 
var replServer = repl.start({});

var defaultEval = replServer.eval;
replServer.eval = function(cmd, context, filename, callback) {
  defaultEval(cmd, context, filename, function(err, result) {
    if (err) return callback(err, result);

    if (result.then && result.catch) {
      result.then(function(promiseResult) {
        util.inspect(promiseResult);
      }).catch(function(err) {
        util.inspect(err);
      });
    } else if (result.then && result.fail) {
      result.then(function(promiseResult) {
        util.inspect(promiseResult);
      }).catch(function(Err) {
        util.inspect(err);
      });
    } else if (result.then) {
      result.then(function(promiseResult) {
        util.inspect(prmoiseResult);
      });
    }

    callback(err, result);
  });
};

