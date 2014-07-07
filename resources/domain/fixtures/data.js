var policy = require("../../../policy");

var domain1 = {
  name : "example.com",
  createdDate : new Date,
  creator : "000000000000000000000000",
  state: "active"
}

var domain2 = {
  name : "example2.com",
  createdDate : new Date,
  creator : "000000000000000000000000",
  state: "inactive"
}

var domain3 = {
  name : "example3.com",
  createdDate : new Date,
  creator : "000000000000000000000000",
  state: "active"
}

module.exports = [ 
  domain1,
  domain2,
  domain3
];
