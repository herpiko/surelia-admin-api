/**
 * Module deps
 */
var debug = require ("debug") ("api-resources-pages-schemas-pages");
var mongoose = require ("mongoose");
var diff = require("deep-diff");
var async = require ("async");
var _ = require ("lodash");

var timestamps = require ("mongoose-times");

var policy = require ("../../../policy"); // todo: using env var, or process.cwd(), make it in lib
var enums = require ("../enums")(policy);
var States = enums.States;


/**
 * Shorthands
 */
var Schema = mongoose.Schema;

/**
 * Page log schema, available via population
 */
var PageLogSchema = new Schema({
  date : { type : Date, default : new Date()},
  actor : { type : String, default : "system"},
  changeset : [{}]
});

var PageLog;

try {
  PageLog = mongoose.model ("PageLog");
} catch (err){
  PageLog = mongoose.model ("PageLog", PageLogSchema);
}

// todo: put in scope
function audit (trail, done) {
  var log = new PageLog(trail);
  log.save(function(err, saved){
    done(err);
  });
}

/**
 * The schema
 */
var PageSchema = new Schema({
  username: { type : String, lowercase: true, trim: true, required: true},
  slug: { type : String, lowercase: true, trim: true, required: true },
  title: { type : String },
  text: { type : String },
  created : { type : Date },
  modified : { type : Date },

  log : [{
    type : Schema.Types.ObjectId,
    ref : "PageLog"
  }]

});

PageSchema.index({slug: 1}, {unique: true});

PageSchema.set("toJSON", { getters: false });

PageSchema.virtual("session").set(function(session) {
  this._session = session;
})
.get(function() {
  return this._session;
});

PageSchema.virtual("previous").set(function(previous) {
  this._previous = previous;
})
.get(function() {
  return this._previous;
});

PageSchema.pre("save", true, function(next, done) {

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

var Page;

try {
  Page = mongoose.model ("Page");
}
catch (err) {
  Page = mongoose.model ("Page", PageSchema);
}

module.exports = Page;
