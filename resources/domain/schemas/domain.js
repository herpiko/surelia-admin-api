/**
 * Module deps
 */
var debug = require ("debug") ("api-resources-domain-schemas-domain");
var mongoose = require ("mongoose");
var _ = require ("lodash");
var diff = require("deep-diff");

var policy = require ("../../../policy"); // todo: using env var, or process.cwd(), make it in lib
var enums = require ("../enums");
var States = enums.States;

var Schema = mongoose.Schema;

/**
 * Domain log schema, available via population
 */
var DomainLogSchema = new Schema({
  date : { type : Date, default : new Date()},
  actor : { type : String, default : "system"},
  changeset : [{}]
});

var DomainLog;

try {
  DomainLog = mongoose.model ("DomainLog");
} catch (err){
  DomainLog = mongoose.model ("DomainLog", DomainLogSchema);
}


function audit (trail, done) {
  var log = new DomainLog(trail);
  log.save(function(err, saved){
    done(err);
  });
}

/**
 * The schema
 */
var DomainSchema = new Schema({
  name : { type : String, required: true, trim: true, unique: true },
  state : { type : String, enum : States.enum, default: States.types.INACTIVE},
  creator : { type : Schema.Types.ObjectId, ref : "Domain", required: true }, 
  createdDate : { type : Date, required: true },
  pendingTransaction : { type : Schema.Types.ObjectId, ref : "CommandQueue", default: Schema.Types.ObjectId }, 
  log : [{
    type : Schema.Types.ObjectId,
    ref : "DomainLog"
  }]


});

try {
  Domain = mongoose.model ("Domain");
}
catch (err) {
  Domain = mongoose.model ("Domain", DomainSchema);
}

DomainSchema.virtual("previous").set(function(previous) {
  this._previous = previous;
})
.get(function() {
  return this._previous;
});

DomainSchema.set("toJSON", { getters: false });
DomainSchema.virtual("session").set(function(session) {
  this._session = session;
})
.get(function() {
  return this._session;
});


DomainSchema.pre("save", true, function(next, done) {

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

DomainSchema.post("init", function(doc) {
  doc.previous = doc.toJSON();
});

module.exports = Domain;
