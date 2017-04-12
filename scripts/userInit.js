var mongoose = require('mongoose');
var fs = require('fs');
var async = require('async');
var db = process.env.DB || 'test';

if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODBURL, function(err){
    if (err) {
      console.log(err);
      process.exit();
    }
  });
}
mongoose.connection.once('open', function(){
  mongoose.connection.db.collection('users', init);
});

var init = function(err, col) {
  if (err) {
    throw err;
    process.exit();
  }
  console.log('yo');
	col.domains.insert({yo:1});
  process.exit();
		
}
