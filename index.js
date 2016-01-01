/**
 * Dependency modules
 */
var panas = require ("panas");
var thunkify = require ("thunkify");
var koa = require ("koa");
var Router = require ("koa-router");
var cors = require("koa-cors");
require("monitor").start();


module.exports = function(options){

  options = options || {};
  options.root = options.root || __dirname + "/endpoints";
  options.driver = options.driver || require ("mongoose");

  var mount = panas.api(options).burn();

  var app = koa();

  var corsOptions = {
    origin: "https://pnsmail.go.id"
  }
  app.use(cors(corsOptions));
  app.use(mount);

  var user = require ("./resources/user/public")(options);
  var misc = require ("./resources/misc/public")(options);
  var page = require ("./resources/pages/public")(options);
  app.statics = [user, misc, page];

  return app;
}
