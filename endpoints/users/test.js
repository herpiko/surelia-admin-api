var request = require ("supertest").agent;
var resources = "../../resources";
var async = require ("async");
var qsify = require ("koa-qs");
var should = require ("should");

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
  db : "mongodb://localhost/sureliaAdminTest", // the db uri
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
        res.body.should.have.property("_id");
        cb(err, res);
      });
    }
    async.mapSeries (users, create, done);
  });

  it ("Get invalid email1", function (done){

    // GET
    var uri = "/api/1/users/email1@example.com";

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      res.body.should.be.empty;
      done(err);
    });

  });

  var id;
  it ("Get email1", function (done){

    // GET
    var uri = "/api/1/users/email1@example2.com";

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      id = res.body._id;
      res.body.should.have.property("_id");
      done(err);
    });
  });

  it ("Get a user", function (done){

    // GET
    var uri = "/api/1/users/" + id;

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      res.body.should.have.property("_id");
      done(err);
    });
  });

  it ("Get admin users", function (done){

    // GET
    var uri = "/api/1/users/example2.com/active?in[roles]=admin";

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      console.log(res.body);
      res.body.should.have.properties("total", "object", "data", "count");
      res.body.data.should.have.length(0);
      done(err);
    });
  });

 

  it ("Get active users", function (done){

    // GET
    var uri = "/api/1/users/example2.com/active";

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      console.log(res.body);
      res.body.should.have.properties("total", "object", "data", "count");
      res.body.data.should.have.length(1);
      done(err);
    });
  });

  it ("Get inactive users", function (done){

    // GET
    var uri = "/api/1/users/example2.com/inactive";

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      res.body.should.have.properties("total", "object", "data", "count");
      res.body.data.should.have.length(0);
      done(err);
    });
  });

  it ("Get pending users", function (done){

    // GET
    var uri = "/api/1/users/example2.com/pending";

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      res.body.should.have.properties("total", "object", "data", "count");
      res.body.data.should.have.length(0);
      done(err);
    });
  });

  it ("Get waiting users", function (done){
    // GET
    var uri = "/api/1/users/example2.com/waiting";

    request (toServer())
    .get (uri)
    .expect (200)
    .end(function (err, res){
      res.body.should.have.properties("total", "object", "data", "count");
      res.body.data.should.have.length(2);
      done(err);
    });
  });

  it ("update a user", function (done){

    // GET
    var uri = "/api/1/users/" + id;

    var data = {
      profile: {
        id: "abc"
      }
    };

    request (toServer())
    .put (uri)
    .send (data)
    .expect (200)
    .end(function (err, res){
      res.body.should.have.property("_id");
      done(err);
    });
  });

  it ("update a user with bad server", function (done){

    // GET
    var uri = "/api/1/users/" + id;

    var data = {
      mailboxServer: "olala"
    };

    request (toServer())
    .put (uri)
    .send (data)
    .expect (400)
    .end(function (err, res){
      res.body.should.have.property("object");
      res.body.object.should.equal("Bad server");
      done(err);
    });
  });

  it ("update a user with non mailbox server", function (done){

    // GET
    var uri = "/api/1/users/" + id;

    var data = {
      mailboxServer: "mail3"
    };

    request (toServer())
    .put (uri)
    .send (data)
    .expect (400)
    .end(function (err, res){
      res.body.should.have.property("object");
      res.body.object.should.equal("Bad server");
      done(err);
    });
  });

  it ("update a user with a mailbox server", function (done){

    // GET
    var uri = "/api/1/users/" + id;

    var data = {
      mailboxServer: "administrator"
    };

    request (toServer())
    .put (uri)
    .send (data)
    .expect (200)
    .end(function (err, res){
      done(err);
    });
  });

  it ("update password", function (done){

    // GET
    var uri = "/api/1/users/" + id;

    var data = {
      password: "OK",
      profile: {
        id: "def"
      }
    };

    request (toServer())
    .put (uri)
    .send (data)
    .expect (200)
    .end(function (err, res){
      res.body.should.have.property("_id");
      done(err);
    });
  });

  it ("Authenticate a bogus user", function (done){
    var uri = "/api/1/account/login";

    request (toServer())
    .post (uri)
    .set ("Content-Type", "application/json")
    .send ({ email : "email1@example.com", password : "12345" })
    .expect (401)
    .end(function (err, res){
      done(err);
    });
  });

  it ("Authenticate another bogus user", function (done){
    var uri = "/api/1/account/login";

    request (toServer())
    .post (uri)
    .set ("Content-Type", "application/json")
    .send ({ email : "email@example2.com", password : "12345" })
    .expect (401)
    .end(function (err, res){
      done(err);
    });
  });

  it ("Authenticate a user with wrong password", function (done){
    var uri = "/api/1/account/login";

    request (toServer())
    .post (uri)
    .set ("Content-Type", "application/json")
    .send ({ email : "email1@example2.com", password : "1234" })
    .expect (401)
    .end(function (err, res){
      res.body.should.have.property("object");
      res.body.object.err.should.equal("invalid password");
      done(err);
    });
  });

  it ("Authenticate a user", function (done){
    var uri = "/api/1/account/login";

    request (toServer())
    .post (uri)
    .set ("Content-Type", "application/json")
    .send ({ email : "email1@example2.com", password : "OK" })
    .expect (200)
    .end(function (err, res){
      done(err);
    });
  });

  it ("suggests a username", function (done){
    var uri = "/api/1/users/example3.com/suggest";

    request (toServer())
    .post (uri)
    .send ({ name : "Sri Rahayu Jasa Santika III" })
    .expect (200)
    .end(function (err, res){
      console.log(res.body);
      done(err);
    });
  });

  it ("suggests a username which name already exists", function (done){
    var uri = "/api/1/users/example3.com/suggest";

    request (toServer())
    .post (uri)
    .send ({ name : "Ro Be RT" })
    .expect (200)
    .end(function (err, res){
      res.body.should.have.properties("username");
      res.body.username.should.equal("ro.be.rt.3");
      done(err);
    });
  });

  it ("suggests a username which name already exists", function (done){
    var uri = "/api/1/users/example3.com/suggest";

    request (toServer())
    .post (uri)
    .send ({ name : "Ru Di A" })
    .expect (200)
    .end(function (err, res){
      res.body.should.have.properties("username");
      res.body.username.should.equal("ru.di.a.1");
      done(err);
    });
  });


  it ("suggests a username which name already exists", function (done){
    var uri = "/api/1/users/example3.com/suggest";

    request (toServer())
    .post (uri)
    .send ({ name : "RoBe" })
    .expect (200)
    .end(function (err, res){
      res.body.should.have.properties("username");
      res.body.username.should.equal("robe.1");
      done(err);
    });
  });

  it ("suggests a username which name does not exist", function (done){
    var uri = "/api/1/users/example3.com/suggest";

    request (toServer())
    .post (uri)
    .send ({ name : "Bo Be" })
    .expect (200)
    .end(function (err, res){
      res.body.should.have.properties("username");
      res.body.username.should.equal("bo.be");
      done(err);
    });
  });

  it ("suggests a username which name does not exist", function (done){
    var uri = "/api/1/users/example3.com/suggest";

    request (toServer())
    .post (uri)
    .send ({ name : "Be Rt" })
    .expect (200)
    .end(function (err, res){
      res.body.should.have.properties("username");
      res.body.username.should.equal("be.rt");
      done(err);
    });
  });




});
