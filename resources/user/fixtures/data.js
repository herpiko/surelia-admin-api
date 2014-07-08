var policy = require("../../../policy");

var email1 = {
  username: "email1",
  domain: "example2.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  mailboxServer: 0,
  quota : 1000,
  group : null,
  state: "active"
}

var email2 = {
  username: "email2",
  domain: "example2.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  mailboxServer: 0,
  group : null,
  quota : 1000
}

var email3 = {
  username: "email3",
  domain: "example3.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  mailboxServer: 0,
  group : null,
  quota : 1000
}

module.exports = [ 
  email1,
  email2,
  email3
];
