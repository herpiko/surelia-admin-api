var compose = require("koa-compose");
var kasta = require("kasta");

// configurable list of avalilable roles and access levels
var config = {

  // predefined roles
  roles: [
    "public",
    "user",
    "admin",
  ],

  // available access levels
  accessLevels: {
    "public": "*",
    "anonymous": [ "public" ],
    "user": [ "user", "admin" ],
    "admin": [ "admin" ],
    "default": ["user"]
  }
}

var acl = kasta(config);

var fort = function (level, bypass) {

  var authentication = function * (next) {

    try {
      if (this.session.user) {
        yield next;
      } else {
        this.throw(401);
      }

    } catch (err) {
      this.throw(401);
    }
  }

  var authorization = function * (next) {

    try {
      var roles = this.session.user.roles;
      this.operations = [];

      for (var i = 0; i < roles.length; i++) {
        var role = roles[i];
        if (role.bitMask & level.bitMask) {
          this.operations.push(role.title);
        }
      }

      if (this.operations.length > 0) {
        yield next;
      } else {
        this.throw(403);
      }

    } catch (err) {
      this.throw(403);
    }
  }

  return compose([authentication, authorization]);
}

var policy = {

  // API related policies
  acl: acl,
  api: {
    filter: fort,
    bypass: false,
    levels: {
    },
    defaults: {
      level: acl.accessLevels.user
    }
  },

  // APP related policies
  app: {}
};

module.exports = policy;
