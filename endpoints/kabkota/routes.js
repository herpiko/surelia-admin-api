var helper = require ("panas").helper;
var Router = helper.Router;

module.exports = Routes;

function Routes (name, mid, handle) {

  var router = new Router(name, mid);

  router.GET ("/kabkotas", handle.find);
  router.GET ("/kabkotas/:id", handle.find);
  router.POST ("/kabkotas", handle.compose);
  router.POST ("/kabkotas/:id", handle.compose);
  router.DEL ("/kabkotas/:id", handle.remove);

  // return the router;
  return router;
}
