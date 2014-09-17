var Router = require("koa-router");
var service = new Router();
var Province = require (__dirname + "/schemas/province");
var KabKota = require (__dirname + "/schemas/kabkota");
var parse = require("co-body");
var options;

service.get("/public-api/1/province", function *() {
  var self = this;
  
  var obj = yield Province
    .find()
    .sort({num : 1})
    .lean()
    .exec(); 
  self.body = { 
    type: "list",
    data: obj
  };
});

service.get("/public-api/1/kab-kota", function *() {
  var self = this;
  
  var obj = yield KabKota
    .find()
    .sort({name : 1})
    .lean()
    .exec(); 
  self.body = { 
    type: "list",
    data: obj
  };
});

service.get("/public-api/1/kab-kota/:id", function *() {
  var self = this;
  var id = self.params.id;
  
  var obj = yield KabKota
    .find({province: id})
    .sort({name : 1})
    .lean()
    .exec(); 
  self.body = { 
    type: "list",
    data: obj
  };
});




module.exports = function(o) {
  options = o;
  return service.middleware();
}
