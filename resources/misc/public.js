var Router = require("koa-router");
var mongoose = require ("mongoose");
var Gridfs = require("gridfs-stream");
var gfs = Gridfs(mongoose.connection.db, mongoose.mongo);
var service = new Router();
var Province = require (__dirname + "/schemas/province");
var KabKota = require (__dirname + "/schemas/kabkota");
var parse = require("co-body");
var onFinished = require("finished");
var Readable = require("stream").Readable;
var Writable = require("stream").Writable;
var base64Stream = require("base64-stream");
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


service.get("/public-api/1/logo/:domain", function *() {

  function findLast() {
    return new Promise((resolve, reject) => {
      gfs.files.find({filename: domain}).sort({uploadDate: -1}).toArray((err, files)=> {
        if (err) {
          reject(err);
          return;
        }
        if (!files || files.length == 0) {
          reject(new Error());
          return;
        }
        resolve(files[0]._id);
      });
    });
  }
  var self = this;
  var domain = self.params.domain;
  var rs = Readable();
  var ws = Writable();
  rs._read = function(){};
  ws._write = function(chunk, enc, next){
    rs.push(chunk);
    next();
  }

  function getLogo(id) {
    var stream = gfs.createReadStream({filename : domain, _id: id});
    stream.on("error", function(err) {
      self.status = err.status || 404;
      self.body = err;
      rs.push(null);
    })
    stream.pipe(ws);
    stream.on("end", function(){
      rs.push(null);
    });
    self.type = "text/plain"
      self.body = rs.pipe(base64Stream.encode());
    onFinished(self, stream.destroy.bind(stream));
  }

  var id = yield findLast();
  getLogo(id);
});


module.exports = function(o) {
  options = o;
  return service.middleware();
}
