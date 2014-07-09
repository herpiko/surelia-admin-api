var request = require ("supertest").agent;
var resources = "../../resources";
var async = require ("async");
var qsify = require ("koa-qs");

// bootstrap
var resources = __dirname + "/../../resources";
var servers = require (resources + "/server/fixtures/data");
var bootstrap = require (resources + "/server/fixtures/bootstrap");

// temp
var server;

var _ = require ("lodash");
var policy = require ("../../policy"); 
// index
var index = __dirname + "/../..";
// related options for api
var options = {
  root : index + "/endpoints", // the app index
  db : "mongodb://localhost/sureliaAdminTest", // the db uri
  driver : require ("mongoose") // the driver
}
options =_.merge(policy, options);

var app = qsify(require(index)(options));
app.on("error", function(err){console.log(err.stack)})

var toServer = function (){ return app.listen() }

var cleanservers = function(done) {
  bootstrap(done);
}

before(cleanservers);

describe ("servers", function (){

  var ids = [];
  it ("creates some servers", function (done){

    function create(server, cb){
      var uri = "/api/1/servers";
      request (toServer())
      .post (uri)
      .send (server)
      .expect (200)
      .end (function (err, res){
        ids.push(res.body._id);
        cb(err, res);
      });
    }
    async.mapSeries (servers, create, done);
  });

  it ("must not create some servers", function (done){

    function create(server, cb){
      var uri = "/api/1/servers";
      request (toServer())
      .post (uri)
      .send (server)
      .expect (400)
      .end (function (err, res){
        cb(err, res);
      });
    }
    async.mapSeries (servers, create, done);
  });

  it ("delete some servers", function (done){
    function deleteServers (cb){
      var params = "";
      _.each(ids, function(item) {
        params += "&ids=" + item;
      });
      var uri = "/api/1/servers?" + params;
      request (toServer())
      .del (uri)
      .send (server)
      .expect (200)
      .end (function (err, res){
        cb(err, res);
      });
    }
    deleteServers (done);
  });

  it ("create some servers again", function (done){

    function create(server, cb){
      var uri = "/api/1/servers";
      request (toServer())
      .post (uri)
      .send (server)
      .expect (200)
      .end (function (err, res){
        ids.push(res.body._id);
        cb(err, res);
      });
    }
    ids = [];
    async.mapSeries (servers, create, done);
  });

  it ("delete some servers again", function (done){

    function deleteServer (server, cb){
      var uri = "/api/1/servers/" + server;
      request (toServer())
      .del (uri)
      .send (server)
      .expect (200)
      .end (function (err, res){
        cb(err, res);
      });
    }
    async.mapSeries (ids, deleteServer, done);
  });

  it ("create some servers again for good", function (done){

    function create(server, cb){
      var uri = "/api/1/servers";
      request (toServer())
      .post (uri)
      .send (server)
      .expect (200)
      .end (function (err, res){
        ids.push(res.body._id);
        cb(err, res);
      });
    }
    ids = [];
    async.mapSeries (servers, create, done);
  });

  it ("modifies a server", function (done){
    var data = {
      name : "administrator"
    };

    var uri = "/api/1/servers/" + ids[0];
    request (toServer())
    .put (uri)
    .send (data)
    .expect (200)
    .end (function (err, res){
      done(err, res);
    });
  });

  it ("list server", function (done){
    var uri = "/api/1/servers";
    request (toServer())
    .get (uri)
    .expect (200)
    .end (function (err, res){
      done(err, res);
    });
  });

  it ("list queue server", function (done){
    var uri = "/api/1/servers?in[type]=queue";
    request (toServer())
    .get (uri)
    .expect (200)
    .end (function (err, res){
      done(err, res);
    });
  });


});
