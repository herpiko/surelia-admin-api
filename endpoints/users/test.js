var request = require ("supertest").agent;
var resources = "../../resources";
var async = require ("async");
var qsify = require ("koa-qs");

process.env.CRYPTO_KEYS = ["olala", "omama"];

// bootstrap
var resources = __dirname + "/../../resources";
var users = require (resources + "/user/fixtures/data");
var bootstrap = require (resources + "/user/fixtures/bootstrap");

// temp
var user;

var _ = require ("lodash");
var policy = require ("../../policy"); 
// index
var index = __dirname + "/../..";
// related options for api
var options = {
  root : index + "/endpoints", // the app index
  db : "mongodb://localhost/sureliatest", // the db uri
  driver : require ("mongoose") // the driver
}
options =_.merge(policy, options);


var app = qsify(require(index)(options));
app.on("error", function(err){console.log(err.stack)})

var toServer = function (){ return app.listen() }

var cleanUsers = function(done) {
  bootstrap(done);
}

before(cleanUsers);

describe ("Users", function (){

  it ("Create users", function (done){

    function create(user, cb){
      var uri = "/api/1/users";
      request (toServer())
      .post (uri)
      .send (user)
      .expect (200)
      .end (function (err, res){
        cb(err, res);
      });
    }
    async.mapSeries (users, create, done);
  });

  it ("Get email1", function (done){

    // GET
    var uri = "/api/1/users/email1@example.com";

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      done(err);
    });

  });

  it ("Authenticate a user", function (done){
    var uri = "/api/1/account/login";

    request (toServer())
    .post (uri)
    .set ("Content-Type", "application/json")
    .send ({ email : "email1@example.com", password : "12345" })
    .expect (200)
    .end(function (err, res){
      done(err);
    });
  });


  it ("Get all users", function (done){

    // GET
    var uri = "/api/1/users";

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      done(err);
    });

  });

});
