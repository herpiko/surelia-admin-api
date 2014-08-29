/**
 * Dependency modules
 */
var panas = require ("panas");
var thunkify = require ("thunkify");
var koa = require ("koa");
var Router = require ("koa-router");

module.exports = function(options){

  options = options || {};
  options.root = options.root || __dirname + "/endpoints";
  options.driver = options.driver || require ("mongoose");

  var mount = panas.api(options).burn();

  var app = koa();
  app.use(mount);
  var user = require ("./resources/user/public")(options);
  app.statics = [user];

  return app;
}
