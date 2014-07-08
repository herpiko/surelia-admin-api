var policy = require("../../../policy");

var group1 = {
  name : "admin1",
  description : "admin1",
  domain : "example2.com",
  createdDate : new Date,
  creator : "000000000000000000000000",
}

var group2 = {
  name : "admin2",
  description : "admin2",
  domain : "example2.com",
  createdDate : new Date,
  creator : "000000000000000000000000",
}

var group3 = {
  name : "admin",
  description : "admin",
  domain : "example3.com",
  createdDate : new Date,
  creator : "000000000000000000000000",
}

module.exports = [ 
  group1,
  group2,
  group3
];
