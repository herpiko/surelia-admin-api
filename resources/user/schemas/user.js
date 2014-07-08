/**
 * Module deps
 */
var debug = require ("debug") ("api-resources-user-schemas-user");
var mongoose = require ("mongoose");
var diff = require("deep-diff");
var async = require ("async");
var auth = require ("./auth");
var _ = require ("lodash");

var timestamps = require ("mongoose-times");

var policy = require ("../../../policy"); // todo: using env var, or process.cwd(), make it in lib
var enums = require ("../enums")(policy);
var Acl = enums.Acl;
var Roles = enums.Roles;
var States = enums.States;


/**
 * Shorthands
 */
var Schema = mongoose.Schema;

/**
 * User log schema, available via population
 */
var UserLogSchema = new Schema({
  date : { type : Date, default : new Date()},
  actor : { type : String, default : "system"},
  changeset : [{}]
});

var UserLog;

try {
  UserLog = mongoose.model ("UserLog");
} catch (err){
  UserLog = mongoose.model ("UserLog", UserLogSchema);
}

// todo: put in scope
function audit (trail, done) {
  var log = new UserLog(trail);
  log.save(function(err, saved){
    done(err);
  });
}

/**
 * The main user schema
 */
var UserSchema = new Schema({
  username: { type : String, lowercase: true, trim: true, required: true},
  domain: { type : Schema.Types.ObjectId, ref : "Domain", required: true}, 
  created : { type : Date },
  modified : { type : Date },
  quota : { type : Number },
  secret : { type : String },
  profile : { type : Object },
  roles : [ { type : String, enum : Roles.enum } ],
  state : { type : String, enum : States.enum, default: States.types.UNKNOWN },
  group : { type : Schema.Types.ObjectId, ref : "Group", default: Schema.Types.ObjectId }, 
  mailboxServer : { type : Schema.Types.ObjectId, ref : "Server", default: Schema.Types.ObjectId, required: true }, 
  pendingTransaction : { type : Schema.Types.ObjectId, ref : "User", default: Schema.Types.ObjectId }, 

  log : [{
    type : Schema.Types.ObjectId,
    ref : "UserLog"
  }]

});

UserSchema.index({username: 1, domain: 1}, {unique: true});

UserSchema.plugin(auth, { keys: process.env.CRYPTO_KEYS });
UserSchema.plugin(timestamps);

UserSchema.set("toJSON", { getters: false });

UserSchema.path("roles").get(function (titles) {
  var arr = [];
  _.map (titles, function (title){
    arr.push(Acl.userRoles[title]);
  });
  if (arr.length > 0) {
    // Only add 'user' if user is authenticated (e.g has roles defined)
    arr.push(Acl.userRoles["user"]);
  }
  return arr;
});

UserSchema.virtual("session").set(function(session) {
  this._session = session;
})
.get(function() {
  return this._session;
});

UserSchema.virtual("previous").set(function(previous) {
  this._previous = previous;
})
.get(function() {
  return this._previous;
});

UserSchema.pre("save", true, function(next, done) {

  var current = this.toJSON();
  var previous = this.previous;

  // build the trail
  var trail = {
    actor : this.session,
    date : new Date(),
    changeset : diff (_.omit(previous, "log"), _.omit(current, "log")) // why this property named as changeset? http://en.wikipedia.org/wiki/Changeset
  };

  trail._id = mongoose.Types.ObjectId();
  this.log.push(trail._id);

  next();

  // save the log
  audit(trail, done);

});

var User;

try {
  User = mongoose.model ("User");
}
catch (err) {
  User = mongoose.model ("User", UserSchema);
}

module.exports = User;
