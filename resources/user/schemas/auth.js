// Dependencies
var mongoose = require ("mongoose");
var bcrypt = require ("nan-bcrypt"); // todo: change to native bcrypt, or require ("bcrypt-nodejs") if it has problem
var serializer = require ("serializer");
var uuid = require("uuid");

// Plugin
function auth (schema, options) {
  options || (options = {})

  // Options
  var loginPath = options.loginPath || "username";
  var hashPath = options.hashPath || "hash";
  var workFactor = options.workFactor || 10;
  var query = {};
  var fields = {};

  // Add paths to schema if not present
  if (!schema.paths[loginPath]) {
    fields[loginPath] = {
      type: String,
      lowercase: true,
      required: true,
      index: { unique: true } 
    }
  }

  if (!schema.paths[hashPath]) {
    fields[hashPath] = { type: String }
  }

  schema.add(fields);

  // Set and encrypt the password of the current model
  schema.method("setPassword", function (password, next) {
    var self = this;
    bcrypt.genSalt(workFactor, function (err, salt) {
      if (err) return next(err)
      bcrypt.hash(password, salt, /*function(){},*/ function (err, hash) {
        if (err) return next(err)
        self[hashPath] = hash
        next(null)
      })
    })
    return this;
  });

  // Authenticate with the configured login path and password on 
  // the model layer, passing the authenticated instance into the callback
  schema.static("authenticate", function (username, domain, password, next) {

    query[loginPath] = username;
    query.domain = domain;
    var t = this.findOne(query);
    t.populate("group", "_id name");
    t.populate("domain", "_id name");
    t.exec(function (err, model) {

      if (err) return next(err)
      if (!model) return next("does not exist");

      if (model.state != "active") {
        return next("user inactive", null);
      }

      bcrypt.compare(password, model[hashPath], function(err, authenticated){
        if (authenticated && model.state == "active") {
          return next(null, model);
        }
        return next("invalid password", null);
      }); // true
    })
    return this;
  })

  schema.static("activate", function (secret, next) {

    var user;
    try {
       user = serializer.parse (secret);
    }
    catch (err) {
      return next("invalid secret");
    }

    this.findById(user._id, function(err, model){
      if (err) return next(err);
      if (!model) return next("model does not exist");

      model.secret = null; 
      model.state = "active";

      model.save (function (err, activated){
        if (err) return next(err);
        if (activated && activated.state == "active") return next(null, activated)
        return next("invalid secret", null);
      });

    });

    return this;
  })

  // Request a password reset
  schema.methods.resetPassword = function(next) {
    var self = this;
    self.secret = uuid.v4();
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 3);
    self.secretExpireDate = expireDate;
    self.save(next);
  };

  // Register a new user instance with the supplied attributes, passing
  // the new instance into the callback if no errors were found
  schema.static("register", function (attr, next) {
    var self = this;
    this.create(attr, function (err, model) {
      if (err) {
        if (/duplicate key/.test(err)) {
          return next(Error(loginPath + " " + attr.username + " taken"));
        }
        return next(err);
      }
      
      model.secret = serializer.stringify({ _id : model._id }, options.keys[0], options.keys[1]);
      model.state = model.state || "pending";

      if (model.state == "activated") {
        model.secret = "";
      }

      model.save(function(err, saved){
        
        if (err) {
          return next (err);
        }

        return next(null, model);  
      });
    })
    return this;
  })

  // Create a virtual path for the password path, storing a temporary
  // unencrypted password that will not be persisted, and returning the 
  // encrypted hash upon request
  schema
    .virtual("password")
    .get(function () {
      return this[hashPath];
    })
    .set(function (password) {
      this._password = password;
    });

  // Create a hash of the password if one has not already been made, this
  // should only be called the first time a password is set, the `setPassword`
  // method will need to be used after it has been created
  schema.pre("save", function (next) {
    if (this._password /*&& !this[hashPath]*/) {
      this.setPassword(this._password, function () {
        next();
      })
    } else {
      next();
    }
  });
}

module.exports = auth;
