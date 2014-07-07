var request = require ("supertest").agent;
var resources = "../../resources";
var async = require ("async");
var qsify = require ("koa-qs");

// bootstrap
var resources = __dirname + "/../../resources";
var domains = require (resources + "/domain/fixtures/data");
var bootstrap = require (resources + "/domain/fixtures/bootstrap");

// temp
var domain;

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

var cleandomains = function(done) {
  bootstrap(done);
}

before(cleandomains);

describe ("domains", function (){

  it ("creates some domains", function (done){

    function create(domain, cb){
      var uri = "/api/1/domains";
      request (toServer())
      .post (uri)
      .send (domain)
      .expect (200)
      .end (function (err, res){
        cb(err, res);
      });
    }
    async.mapSeries (domains, create, done);
  });

  var id;
  it ("gets domain1", function (done){

    // GET
    var uri = "/api/1/domains/example.com";

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      id = res.body._id;
      done(err);
    });

  });

  it ("gets all domains", function (done){

    // GET
    var uri = "/api/1/domains";

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      done(err);
    });

  });

  it ("should deactivate a domain", function (done){

    // GET
    var uri = "/api/1/domains/" + id + "/active";

    request (toServer())
    .del(uri)
    .expect (200)
    .end(function (err, res){
      done(err);
    });
  });

  it ("should activate a domain", function (done){

    // GET
    var uri = "/api/1/domains/" + id + "/active";

    request (toServer())
    .put(uri)
    .expect (200)
    .end(function (err, res){
      done(err);
    });
  });

  it ("should remove a domain", function (done){

    // GET
    var uri = "/api/1/domains/" + id;

    request (toServer())
    .del(uri)
    .expect (200)
    .end(function (err, res){
      done(err);
    });
  });

  it ("must not create same domains", function (done){

    function create(domain, cb){
      var uri = "/api/1/domains";
      request (toServer())
      .post (uri)
      .send (domain)
      .expect (400)
      .end (function (err, res){
        cb(err, res);
      });
    }
    create({
      name: "example2.com",
      creator: "000000000000000000000000",
      createdDate: new Date
    }, done);
  });


});
