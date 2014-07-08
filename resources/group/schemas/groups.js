/**
 * Module deps
 */
var debug = require ("debug") ("api-resources-group-schemas-group");
var mongoose = require ("mongoose");
var _ = require ("lodash");
var diff = require("deep-diff");

var Schema = mongoose.Schema;

/**
 * Group log schema, available via population
 */
var GroupLogSchema = new Schema({
  date : { type : Date, default : new Date()},
  actor : { type : String, default : "system"},
  changeset : [{}]
});

var GroupLog;

try {
  GroupLog = mongoose.model ("GroupLog");
} catch (err){
  GroupLog = mongoose.model ("GroupLog", GroupLogSchema);
}

function audit (trail, done) {
  var log = new GroupLog(trail);
  log.save(function(err, saved){
    done(err);
  });
}

/**
 * The schema
 */
var GroupSchema = new Schema({
  name : { type : String, required: true, trim: true, unique: true },
  description : { type : String },
  domain : { type : Schema.Types.ObjectId, ref : "Domain", required: true }, 
  creator : { type : Schema.Types.ObjectId, ref : "User", required: true }, 
  createdDate : { type : Date, required: true },
  log : [{
    type : Schema.Types.ObjectId,
    ref : "GroupLog"
  }]


});
GroupSchema.index({name: 1, domain: 1}, {unique: true});

try {
  Group = mongoose.model ("Group");
}
catch (err) {
  Group = mongoose.model ("Group", GroupSchema);
}

GroupSchema.virtual("previous").set(function(previous) {
  this._previous = previous;
})
.get(function() {
  return this._previous;
});

GroupSchema.set("toJSON", { getters: false });
GroupSchema.virtual("session").set(function(session) {
  this._session = session;
})
.get(function() {
  return this._session;
});


GroupSchema.pre("save", true, function(next, done) {

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

GroupSchema.post("init", function(doc) {
  doc.previous = doc.toJSON();
});

module.exports = Group;
