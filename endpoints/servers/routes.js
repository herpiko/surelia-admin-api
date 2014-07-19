var helper = require ("panas").helper;
var Router = helper.Router;

module.exports = Routes;

function Routes (name, mid, handle) {

  var router = new Router(name, mid);

  // servers
  router.GET ("/servers", handle.find);
  router.GET ("/servers/:id", handle.findOne);
  router.POST ("/servers", handle.create);

  router.GET ("/servers/:id/stat/os", handle.statOS);
  router.GET ("/servers/:id/stat/mailbox-process", handle.statMailboxProcess);
  router.GET ("/servers/:id/stat/top-receiver", handle.statTopReceiver);
  router.GET ("/servers/:id/stat/top-failures", handle.statTopFailures);
  router.GET ("/servers/:id/stat/top-remote-failures", handle.statTopRemoteFailures);

  router.PUT ("/servers/:id", handle.update);
  router.DEL ("/servers/:id", handle.remove);
  router.DEL ("/servers", handle.remove);

  return router;
}
