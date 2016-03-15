/**
 * Module deps
 */
var mongoose = require ("mongoose");
var async = require ("async");
var _ = require ("lodash");

var timestamps = require ("mongoose-times");

var ObjectId = mongoose.Types.ObjectId; 

/**
 * Shorthands
 */
var Schema = mongoose.Schema;

/**
 * The main user schema
 */
var AdminActivitySchema = new Schema({
  timestamp : { type : Date},
  localDomain : { type : String},
  by : { type : String},
  activity: { type : String}, 
  data : { type : Object },
});

AdminActivitySchema.index({activity: 1, timestamp: 1});

var Activities;

try {
  AdminActivities = mongoose.model ("AdminActivities");
}
catch (err) {
  AdminActivities = mongoose.model ("AdminActivities", AdminActivitySchema);
}

module.exports = AdminActivities;
