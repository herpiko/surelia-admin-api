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

  if (retrieved && retrieved.length == 1) {
    self.body = { text: "<h1>" + retrieved[0].title + "</h1>" + "\n" + retrieved[0].text };
  } else {
    self.status = 404; 
  }

});

module.exports = function(o) {
  options = o;
  return service.middleware();
}
