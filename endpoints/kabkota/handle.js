var helper = require ("panas").helper;
var handle;


module.exports = Kabkota;

/**
 * The Kabkota handlers
 */
function Kabkota (options) {
  var model = require ("./model")(options);
  handle = helper.Handle (model);
  if (!(this instanceof Kabkota)) return new Kabkota (options);
}

Kabkota.prototype.find = function * (){
  yield handle.get (this, "find", {});
}

Kabkota.prototype.compose = function * (){
  yield handle.post (this, "compose", {});
}

Kabkota.prototype.remove = function * (){
  yield handle.del (this, "remove", {});
}

