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

Server.prototype.statOS = function * (){
  yield handle.get (this, "statOS", {});
}

Server.prototype.statMailboxProcess = function * (){
  yield handle.get (this, "statMailboxProcess", {});
}

Server.prototype.statTopReceiver = function * (){
  yield handle.get (this, "statTopReceiver", {});
}

Server.prototype.statTopFailures = function * (){
  yield handle.get (this, "statTopFailures", {});
}

Server.prototype.statTopRemoteFailures = function * (){
  yield handle.get (this, "statTopRemoteFailures", {});
}

Server.prototype.serverStat = function * (){
  yield handle.get (this, "serverStat", {});
}


