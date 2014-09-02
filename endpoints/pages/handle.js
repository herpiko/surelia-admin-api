var helper = require ("panas").helper;
var handle;


module.exports = Page;

/**
 * The Page handlers
 */
function Page (options) {
  var model = require ("./model")(options);
  handle = helper.Handle (model);
  if (!(this instanceof Page)) return new Page (options);
}

Page.prototype.find = function * (){
  yield handle.get (this, "find", {});
}

Page.prototype.compose = function * (){
  yield handle.post (this, "compose", {});
}

Page.prototype.remove = function * (){
  yield handle.del (this, "remove", {});
}

