var helper = require ("panas").helper;
var handle;


module.exports = User;

/**
 * The User handlers
 */
function User (options) {
  var model = require ("./model")(options);
  handle = helper.Handle (model);
  if (!(this instanceof User)) return new User (options);
}

User.prototype.find = function * (){
  yield handle.get (this, "find", {});
}

User.prototype.findActive = function * (){
  yield handle.get (this, "findActive", {});
}

User.prototype.findInactive = function * (){
  yield handle.get (this, "findInactive", {});
}

User.prototype.findPending = function * (){
  yield handle.get (this, "findPending", {});
}

User.prototype.findPendingTransaction = function * (){
  yield handle.get (this, "findPendingTransaction", {});
}

User.prototype.findOne = function * (){
  yield handle.get (this, "findOne", {});
}

User.prototype.update = function * (){
  yield handle.put (this, "update", {});
}

User.prototype.remove = function * (){
  yield handle.get (this, "remove", {});
}

User.prototype.create = function * (){
  yield handle.post (this, "create", {});
}

User.prototype.authenticate = function * (){
  yield handle.post (this, "authenticate", {});
}

User.prototype.activate = function * (){
    yield handle.get (this, "activate", {});
}

User.prototype.account = function * (){
    yield handle.get (this, "account", {});
}

User.prototype.suggest = function * (){
  yield handle.post (this, "suggest", {});
}

User.prototype.statByClientType = function * (){
  yield handle.get (this, "statByClientType", {});
}

User.prototype.statByProvince = function * (){
  yield handle.get (this, "statByProvince", {});
}

User.prototype.totalUser = function * (){
  yield handle.get (this, "totalUser", {});
}

User.prototype.totalOrg = function * (){
  yield handle.get (this, "totalOrg", {});
}


