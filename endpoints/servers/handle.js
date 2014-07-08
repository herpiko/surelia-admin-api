var helper = require ("panas").helper;
var handle;


module.exports = Server;

/**
 * The Server handlers
 */
function Server (options) {
  var model = require ("./model")(options);
  handle = helper.Handle (model);
  if (!(this instanceof Server)) return new Server (options);
}

Server.prototype.find = function * (){
  yield handle.get (this, "find", {});
}

Server.prototype.findOne = function * (){
  yield handle.get (this, "findOne", {});
}

Server.prototype.update = function * (){
  yield handle.put (this, "update", {});
}

Server.prototype.remove = function * (){
  yield handle.get (this, "remove", {});
}

Server.prototype.create = function * (){
  yield handle.post (this, "create", {});
}

