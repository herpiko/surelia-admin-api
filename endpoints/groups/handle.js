var helper = require ("panas").helper;
var handle;


module.exports = Group;

/**
 * The Group handlers
 */
function Group (options) {
  var model = require ("./model")(options);
  handle = helper.Handle (model);
  if (!(this instanceof Group)) return new Group (options);
}

Group.prototype.find = function * (){
  yield handle.get (this, "find", {});
}

Group.prototype.findOne = function * (){
  yield handle.get (this, "findOne", {});
}

Group.prototype.update = function * (){
  yield handle.put (this, "update", {});
}

Group.prototype.remove = function * (){
  yield handle.get (this, "remove", {});
}

Group.prototype.create = function * (){
  yield handle.post (this, "create", {});
}

