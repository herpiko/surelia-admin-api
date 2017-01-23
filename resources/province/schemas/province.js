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
 * Province log schema, available via population
 */
var ProvinceLogSchema = new Schema({
  date : { type : Date, default : new Date()},
  actor : { type : String, default : "system"},
  changeset : [{}]
});

var ProvinceLog;

try {
  ProvinceLog = mongoose.model ("ProvinceLog");
} catch (err){
  ProvinceLog = mongoose.model ("ProvinceLog", ProvinceLogSchema);
}

/**
 * The schema
 */
var ProvinceSchema = new Schema({
  name: { type : String },
});

ProvinceSchema.index({slug: 1}, {unique: true});

ProvinceSchema.set("toJSON", { getters: false });

var Province;

try {
  Province = mongoose.model ("Province");
}
catch (err) {
  Province = mongoose.model ("Province", ProvinceSchema);
}

module.exports = Province;
