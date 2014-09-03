var Router = require("koa-router");
var service = new Router();
var User = require (__dirname + "/../user").schemas.User;
var Domain = require (__dirname + "/../domain").schemas.Domain;
var parse = require("co-body");
var options;
var simplesmtp = require("simplesmtp");
var fs = require("fs");
var Filter = require('filter');

var RESET_PASSWORD_FILE = __dirname + "/reset-password-email.txt";

var sendEmail = function(target, id) {
  if (options && options.email) {
    var smtp = options.email.smtp;
    var email = options.email;


    var urlFilter = new Filter(function (data) {
      console.log(data);
      var d = data.toString().replace("%URL%", "https://pnsmail.go.id/reset/claim?id=" + id);
      d = d.replace("%FROM%", email.from);
      d = d.replace("%FROM-NAME%", email.fromName);
      d = d.replace("%TO%", target);

      this.emit("data", d);
    });

    var client = simplesmtp.connect(smtp.port, smtp.host, smtp.options); 

    client.once("idle", function(){
      client.useEnvelope({
        from: email.from,
        to: [target]
      });
    });

    client.on("message", function(){
      fs.createReadStream(RESET_PASSWORD_FILE).pipe(urlFilter);
      urlFilter.pipe(client);
    });
  }
}

service.post("/public-api/1/reset/request", function *() {
  var self = this;
  var param = yield parse(this);
  
  self.response.header = {"Oka":"12"};
  var spitErr = function(err) {
      console.log("x", err);
    self.status = 404;
    self.body = err;
  }

  if (param.email && param.email.indexOf("@") > 0) {
    var info = param.email.split("@");
    var domain = yield Domain.findOne({name: info[1]}).exec();
    if (!domain) return spitErr({message:"Invalid domain"});
    var user = yield User.findOne({username: info[0], domain: domain._id}).exec();
    if (user && user.profile && user.profile.email) {
      user.resetPassword();
      self.status = 200;
      self.body = {message: "Success", expireDate: user.secretExpireDate};
      setTimeout(function() {
        sendEmail(user.profile.email, user.secret);
      }, 0);
    } else {
      spitErr({message: "Invalid user"});
    }
  } else {
    self.body = "Invalid request";
    self.status = 400;
  }
});

service.post("/public-api/1/reset/claim", function *() {
  var self = this;
  var param = yield parse(this);
  
  var spitErr = function(err) {
      console.log("x", err);
    self.status = 404;
    self.body = err;
  }

  if (param.email && param.email.indexOf("@") > 0 && param.password, param.claim) {
    var info = param.email.split("@");
    var domain = yield Domain.findOne({name: info[1]}).exec();
    if (!domain) return spitErr({message:"Invalid domain"});
    var user = yield User.findOne({username: info[0], domain: domain._id, secret: param.claim}).exec();
    if (user && user.profile && user.profile.email) {
      user.secret = "";
      user.setPassword(param.password, function(err, result) {
        user.save();
      });
      self.status = 200;
      self.body = {message: "Success"};
    } else {
      spitErr({message: "Invalid claim"});
    }
  } else {
    self.body = "Invalid request";
    self.status = 400;
  }
});

module.exports = function(o) {
  options = o;
  return service.middleware();
}
