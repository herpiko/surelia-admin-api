var bootstrap = require ("./bootstrap");

var mongoose = require ("mongoose");
mongoose.connect ("mongodb://localhost/test");

// todo test
// DEBUG=* node resources/structure/organization/fixtures/test
bootstrap()(function(){
  console.log ("done");
  mongoose.disconnect();
});