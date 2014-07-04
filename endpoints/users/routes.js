var helper = require ("panas").helper;
var Router = helper.Router;

module.exports = Routes;

function Routes (name, mid, handle) {

  var router = new Router(name, mid);

  // users
  router.GET ("/users", handle.find);
  router.GET ("/users/active", handle.findActive);
  router.GET ("/users/inactive", handle.findInactive);
  router.GET ("/users/pending", handle.findPending);
  router.GET ("/users/waiting", handle.findPendingTransaction);
  router.GET ("/users/:id", handle.findOne);
  router.POST ("/users", handle.create);
  router.PUT ("/users/:id", handle.update);
  router.DEL ("/users/:id", handle.remove);
  router.DEL ("/users", handle.remove);

  router.GET ("/account", handle.account);
  router.POST ("/account/login", handle.authenticate);
  router.GET ("/account/activate/:secret", handle.activate);

  // return the router;
  return router;
}
