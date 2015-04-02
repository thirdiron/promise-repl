var repl = require("repl");
 
var replServer = repl.start({});

replServer.writer = function(result) {
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

  if (result.then) {
    console.log('[Promise]');
  }
};
