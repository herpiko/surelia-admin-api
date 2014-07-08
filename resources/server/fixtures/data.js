var policy = require("../../../policy");

var server1 = {
  name : "mail1",
  description : "admin1",
  ip : "192.168.0.1",
  createdDate : new Date,
  type : ["mailbox", "queue"]
}

var server2 = {
  name : "mail2",
  description : "admin2",
  ip : "192.168.0.2",
  createdDate : new Date,
  type : ["mailbox"]
}

var server3 = {
  name : "mail3",
  ip : "192.168.0.3",
  description : "admin",
  createdDate : new Date,
  type : ["queue"]
}

module.exports = [ 
  server1,
  server2,
  server3
];
