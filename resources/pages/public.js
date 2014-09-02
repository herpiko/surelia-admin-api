var Router = require("koa-router");
var service = new Router();
var Page = require (__dirname + "/../pages").schemas.Page;
var parse = require("co-body");
var options;
var fs = require("fs");
var Filter = require('filter');

service.get("/public-api/1/pages/:id", function *() {
  var self = this;
  var id = self.params.id;
  var query = {
    slug: id
  };

  var task = Page.find(query, "-__v -log");

  var retrieved = yield task.exec();

  var obj = {
    object : "list",
    count : retrieved.length,
    data : retrieved
  }

  self.body = obj;
});

module.exports = function(o) {
  options = o;
  return service.middleware();
}
