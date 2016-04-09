var helper = require ("panas").helper;
var handle;


module.exports = Domain;

/**
 * The Domain handlers
 */
function Domain (options) {
  var model = require ("./model")(options);
  handle = helper.Handle (model);
  if (!(this instanceof Domain)) return new Domain (options);
}

Domain.prototype.find = function * (){
  yield handle.get (this, "find", {});
}

Domain.prototype.findActive = function * (){
  yield handle.get (this, "findActive", {});
}

Domain.prototype.findInactive = function * (){
  yield handle.get (this, "findInactive", {});
}

Domain.prototype.findOne = function * (){
  yield handle.get (this, "findOne", {});
}

Domain.prototype.update = function * (){
  yield handle.put (this, "update", {});
}

Domain.prototype.remove = function * (){
  yield handle.get (this, "remove", {});
}

Domain.prototype.create = function * (){
  yield handle.post (this, "create", {});
}

Domain.prototype.activate = function * (){
    yield handle.get (this, "activate", {});
}

Domain.prototype.deactivate = function * (){
    yield handle.get (this, "deactivate", {});
}

Domain.prototype.statIncomingCounter = function * (){
    yield handle.get (this, "statIncomingCounter", {});
}

Domain.prototype.statOutgoingCounter = function * (){
    yield handle.get (this, "statOutgoingCounter", {});
}

Domain.prototype.uploadLogo = function * (){
    yield handle.uploadFile (this, "uploadLogo", {});
}

Domain.prototype.getLogo = function * (){
    yield handle.downloadFile (this, "getLogo", {});
}

