// insert admin only
var mongoose = require ("mongoose");
mongoose.connect ("mongodb://localhost/pnsmailAdmin");

process.env.CRYPTO_KEYS = ["admin", "keys"];
var schemas = require ("../schemas");
var domainSchemas = require ("../../domain/schemas");

var User = schemas.User;
var Domain = domainSchemas.Domain;


Domain.remove(function(){
  User.remove(function(){
    var domain = {
      name : "pnsmail.go.id",
      state : "active",
      creator : "000000000000000000000000",
      createdDate : new Date
    }

    var user = {
      username: "admin",
      password : "pnsmail123",
      name : "Admin",
      mailboxServer : "000000000000000000000000",
      roles : ["admin"]
    };

    Domain.create(domain, function(err, domainData) { 
      user.domain = domainData._id;
      User.register(user, function(err, registered){
      console.log(err);
        if (err) throw err;
        User.activate(registered.secret, function(err, activated){
          if (err) throw err;
          console.log ("admin@pnsmail.go.id is created", user.password);
          mongoose.disconnect();
        });
      });
    });
  });
});
