var helper = require ("panas").helper;
var handle;


module.exports = Province;

/**
 * The Province handlers
 */
function Province (options) {
  var model = require ("./model")(options);
  handle = helper.Handle (model);
  if (!(this instanceof Province)) return new Province (options);
}

Province.prototype.find = function * (){
  yield handle.get (this, "find", {});
}

Province.prototype.compose = function * (){
  yield handle.post (this, "compose", {});
}

Province.prototype.remove = function * (){
  yield handle.del (this, "remove", {});
}

