var helper = require ("panas").helper;
var Router = helper.Router;

module.exports = Routes;

function Routes (name, mid, handle) {

  var router = new Router(name, mid);

  // domains
  router.GET ("/domains", handle.find);
  router.GET ("/domains/active", handle.findActive);
  router.GET ("/domains/inactive", handle.findInactive);
  router.GET ("/domains/logo/:filename", handle.getLogo);
  router.GET ("/domains/:id", handle.findOne);
  router.POST ("/domains", handle.create);

  router.POST ("/domains/logo", handle.uploadLogo);
  router.POST ("/domains/:id", handle.update);
  router.PUT ("/domains/:id", handle.update);
  router.DEL ("/domains/:id", handle.remove);
  router.DEL ("/domains", handle.remove);

  router.PUT ("/domains/:id/active", handle.activate);
  router.DEL ("/domains/:id/active", handle.deactivate);

  return router;
}
