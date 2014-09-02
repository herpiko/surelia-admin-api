var request = require ("supertest").agent;
var resources = "../../resources";
var async = require ("async");
var qsify = require ("koa-qs");
var should = require ("should");

process.env.CRYPTO_KEYS = ["olala", "omama"];

// bootstrap
var resources = __dirname + "/../../resources";
var bootstrap = require (resources + "/pages/fixtures/bootstrap");

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

describe ("Pages", function (){

  var id;
  it ("should create first page", function (done){

    var data = {
      title: "Abc to  12 ",
      username: "abc",
      text: "abc"
    }
    function create(data, cb){
      var uri = "/api/1/pages";
      request (toServer())
      .post (uri)
      .send (data)
      .expect (200)
      .end (function (err, res){
        res.body.should.have.property("_id");
        id = res.body._id;
        cb(err, res);
      });
    }

    create(data, done);
  });

  it ("should create another page", function (done){

    var data = {
      title: "Abc to 32 ",
      username: "abc",
      text: "ebc"
    }
    function create(data, cb){
      var uri = "/api/1/pages";
      request (toServer())
      .post (uri)
      .send (data)
      .expect (200)
      .end (function (err, res){
        res.body.should.have.property("_id");
        id = res.body._id;
        cb(err, res);
      });
    }

    create(data, done);
  });

  it ("should list pages", function (done){

    function list(cb){
      var uri = "/api/1/pages";
      request (toServer())
      .get (uri)
      .expect (200)
      .end (function (err, res){
        res.body.should.have.property("data");
        res.body.data.should.have.length(2);
        cb(err, res);
      });
    }

    list(done);
  });

  it ("should read a page", function (done){

    function list(cb){
      var uri = "/api/1/pages/abc-to-12";
      request (toServer())
      .get (uri)
      .expect (200)
      .end (function (err, res){
        res.body.should.have.property("data");
        res.body.data.should.have.length(1);
        res.body.data[0].should.have.property("slug");
        res.body.data[0].slug.should.eql("abc-to-12");
        cb(err, res);
      });
    }

    list(done);
  });

  it ("should read a page", function (done){

    function list(cb){
      var uri = "/api/1/pages/" + id;
      request (toServer())
      .get (uri)
      .expect (200)
      .end (function (err, res){
        res.body.should.have.property("data");
        res.body.data.should.have.length(1);
        res.body.data[0].should.have.property("slug");
        res.body.data[0].slug.should.eql("abc-to-32");
        cb(err, res);
      });
    }

    list(done);
  });

  it ("should edit a page", function (done){

    var data = {
      title: " Def to  12 ",
      text: "abc"
    }
    function edit(data, cb){
      var uri = "/api/1/pages/" + id;
      request (toServer())
      .post (uri)
      .send (data)
      .expect (200)
      .end (function (err, res){
        res.body.should.have.property("_id");
        res.body._id.should.eql(id);
        res.body.title.should.eql(data.title);
        res.body.text.should.eql(data.text);
        cb(err, res);
      });
    }

    edit(data, done);
  });

  it ("should delete a page", function (done){

    function remove(cb){
      var uri = "/api/1/pages/" + id;
      request (toServer())
      .del (uri)
      .expect (200)
      .end (function (err, res){
        res.body.should.have.property("_id");
        cb(err, res);
      });
    }

    remove(done);
  });



});
