var helper = require ("panas").helper;
var Router = helper.Router;

module.exports = Routes;

function Routes (name, mid, handle) {

  var router = new Router(name, mid);

  router.GET ("/provinces", handle.find);
  router.GET ("/provinces/:id", handle.find);
  router.POST ("/provinces", handle.compose);
  router.POST ("/provinces/:id", handle.compose);
  router.DEL ("/provinces/:id", handle.remove);

  // return the router;
  return router;
}
