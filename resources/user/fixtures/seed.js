// insert admin only
var mongoose = require ("mongoose");
mongoose.connect ("mongodb://localhost/sureliatest");

process.env.CRYPTO_KEYS = ["admin", "keys"];
var schemas = require ("../schemas");
var User = schemas.User;

User.remove(function(){
  var user = {
    email : "admin@example.com",
    password : "12345",
    name : "Admin",
    roles : ["admin"]
  };

  User.register(user, function(err, registered){
    if (err) throw err;
    User.activate(registered.secret, function(err, activated){
      if (err) throw err;
      console.log ("admin@example.com is created", user.password);
      mongoose.disconnect();
    });
  });
});
