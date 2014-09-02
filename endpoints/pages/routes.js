var helper = require ("panas").helper;
var Router = helper.Router;

module.exports = Routes;

function Routes (name, mid, handle) {

  var router = new Router(name, mid);

  router.GET ("/pages", handle.find);
  router.GET ("/pages/:id", handle.find);
  router.POST ("/pages", handle.compose);
  router.POST ("/pages/:id", handle.compose);
  router.DEL ("/pages/:id", handle.remove);

  // return the router;
  return router;
}
