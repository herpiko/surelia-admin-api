var request = require ("supertest").agent;
var resources = "../../resources";
var async = require ("async");
var qsify = require ("koa-qs");
var should = require("should");

// bootstrap
var resources = __dirname + "/../../resources";
var groups = require (resources + "/group/fixtures/data");
var bootstrap = require (resources + "/group/fixtures/bootstrap");

// temp
var group;

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

var cleangroups = function(done) {
  bootstrap(done);
}

before(cleangroups);

describe ("groups", function (){

  var ids = [];
  it ("creates some groups", function (done){

    function create(group, cb){
      var uri = "/api/1/groups";
      request (toServer())
      .post (uri)
      .send (group)
      .expect (200)
      .end (function (err, res){
        ids.push(res.body._id);
        cb(err, res);
      });
    }
    async.mapSeries (groups, create, done);
  });

  it ("must not create some groups", function (done){

    function create(group, cb){
      var uri = "/api/1/groups";
      request (toServer())
      .post (uri)
      .send (group)
      .expect (400)
      .end (function (err, res){
        cb(err, res);
      });
    }
    async.mapSeries (groups, create, done);
  });

  it ("delete some groups", function (done){
    function deleteGroups (cb){
      var params = "";
      _.each(ids, function(item) {
        params += "&ids=" + item;
      });
      var uri = "/api/1/groups?" + params;
      request (toServer())
      .del (uri)
      .send (group)
      .expect (200)
      .end (function (err, res){
        cb(err, res);
      });
    }
    deleteGroups (done);
  });

  it ("create some groups again", function (done){

    function create(group, cb){
      var uri = "/api/1/groups";
      request (toServer())
      .post (uri)
      .send (group)
      .expect (200)
      .end (function (err, res){
        ids.push(res.body._id);
        cb(err, res);
      });
    }
    ids = [];
    async.mapSeries (groups, create, done);
  });

  it ("delete some groups again", function (done){

    function deleteGroup (group, cb){
      var uri = "/api/1/groups/" + group;
      request (toServer())
      .del (uri)
      .send (group)
      .expect (200)
      .end (function (err, res){
        cb(err, res);
      });
    }
    async.mapSeries (ids, deleteGroup, done);
  });

  it ("create some groups again for good", function (done){

    function create(group, cb){
      var uri = "/api/1/groups";
      request (toServer())
      .post (uri)
      .send (group)
      .expect (200)
      .end (function (err, res){
        ids.push(res.body._id);
        cb(err, res);
      });
    }
    ids = [];
    async.mapSeries (groups, create, done);
  });

  it ("modifies a group", function (done){
    var data = {
      name : "administrator"
    };

    var uri = "/api/1/groups/" + ids[0];
    request (toServer())
    .put (uri)
    .send (data)
    .expect (200)
    .end (function (err, res){
      done(err, res);
    });
  });

  it ("list group in a domain", function (done){
    var uri = "/api/1/groups/example2.com";
    request (toServer())
    .get (uri)
    .expect (200)
    .end (function (err, res){
      res.body.should.have.properties("data", "count", "total", "object");
      res.body.data.should.have.length(2);
      done(err, res);
    });
  });




});
