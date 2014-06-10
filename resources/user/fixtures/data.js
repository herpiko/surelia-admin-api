var policy = require("../../../policy");

var email1 = {
  email : "email1@example.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  mailboxServer: 0,
  quota : 1000,
  state: "active"
}

var email2 = {
  email : "email2@example.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  mailboxServer: 0,
  quota : 1000
}

var email3 = {
  email : "email3@example.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  mailboxServer: 0,
  quota : 1000
}

module.exports = [ 
  email1,
  email2,
  email3
];
