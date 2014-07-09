var helper = require ("panas").helper;
var Router = helper.Router;

module.exports = Routes;

function Routes (name, mid, handle) {

  var router = new Router(name, mid);

  // groups
  router.GET ("/groups/:id", handle.find);
  router.POST ("/groups", handle.create);

  router.PUT ("/groups/:id", handle.update);
  router.DEL ("/groups/:id", handle.remove);
  router.DEL ("/groups", handle.remove);

  return router;
}
