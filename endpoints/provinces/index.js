var routes = require ("./routes");
var handle = require ("./handle")

module.exports = Api;

function Api (name, options) {
  var noop = function * (next) { yield next; };
  var filter = options.filter || noop;
  return routes(name, filter, handle (options));
}

