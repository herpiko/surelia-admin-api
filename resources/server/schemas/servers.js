/**
 * Module deps
 */
var debug = require ("debug") ("api-resources-server-schemas-server");
var mongoose = require ("mongoose");
var _ = require ("lodash");
var diff = require("deep-diff");
var enums = require ("../enums");
var States = enums.States;
var Types = enums.Types;

var Schema = mongoose.Schema;

/**
 * Server log schema, available via population
 */
var ServerLogSchema = new Schema({
  date : { type : Date, default : new Date()},
  actor : { type : String, default : "system"},
  changeset : [{}]
});

var ServerLog;

try {
  ServerLog = mongoose.model ("ServerLog");
} catch (err){
  ServerLog = mongoose.model ("ServerLog", ServerLogSchema);
}

function audit (trail, done) {
  var log = new ServerLog(trail);
  log.save(function(err, saved){
    done(err);
  });
}

/**
 * The schema
 */
var ServerSchema = new Schema({
  name : { type : String, required: true, trim: true, unique: true },
  description : { type : String },
  ip : { type : String },
  createdDate : { type : Date, required: true },
  type : [{ type : String, enum : Types.enum }],
  log : [{
    type : Schema.Types.ObjectId,
    ref : "ServerLog"
  }]


});

try {
  Server = mongoose.model ("Server");
}
catch (err) {
  Server = mongoose.model ("Server", ServerSchema);
}

ServerSchema.virtual("previous").set(function(previous) {
  this._previous = previous;
})
.get(function() {
  return this._previous;
});

ServerSchema.set("toJSON", { getters: false });
ServerSchema.virtual("session").set(function(session) {
  this._session = session;
})
.get(function() {
  return this._session;
});


ServerSchema.pre("save", true, function(next, done) {

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

module.exports = Server;
