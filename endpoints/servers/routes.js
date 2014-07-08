var helper = require ("panas").helper;
var Router = helper.Router;

module.exports = Routes;

function Routes (name, mid, handle) {

  var router = new Router(name, mid);

  // servers
  router.GET ("/servers", handle.find);
  router.GET ("/servers/:id", handle.findOne);
  router.POST ("/servers", handle.create);

  router.PUT ("/servers/:id", handle.update);
  router.DEL ("/servers/:id", handle.remove);
  router.DEL ("/servers", handle.remove);

  return router;
}
