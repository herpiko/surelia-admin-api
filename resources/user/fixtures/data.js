var policy = require("../../../policy");

var email1 = {
  username: "email1",
  domain: "example2.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  mailboxServer: "mail2",
  quota : 1000,
  group : null,
  server : "mail2",
  state: "active"
}

var email2 = {
  username: "email2",
  domain: "example2.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  mailboxServer: "mail2",
  group : null,
  server : "mail2",
  quota : 1000
}

var email3 = {
  username: "email3",
  domain: "example3.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  group : null,
  mailboxServer: "mail2",
  quota : 1000
}

var email4 = {
  username: "ro.be.rt",
  domain: "example3.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  group : null,
  mailboxServer: "mail2",
  quota : 1000
}

var email5 = {
  username: "ro.be.rt.1",
  domain: "example3.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  group : null,
  mailboxServer: "mail2",
  quota : 1000
}

var email6 = {
  username: "ro.be.rt.2",
  domain: "example3.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  group : null,
  mailboxServer: "mail2",
  quota : 1000
}

var email7 = {
  username: "ru.di.a",
  domain: "example3.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  group : null,
  mailboxServer: "mail2",
  quota : 1000
}
var email8 = {
  username: "robe",
  domain: "example3.com",
  password : "12345",
  created : new Date,
  modified : new Date,
  group : null,
  mailboxServer: "mail2",
  quota : 1000
}




module.exports = [ 
  email1,
  email2,
  email3,
  email4,
  email5,
  email6,
  email7,
  email8,
];
