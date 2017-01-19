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
 * Kabkota log schema, available via population
 */
var KabkotaLogSchema = new Schema({
  date : { type : Date, default : new Date()},
  actor : { type : String, default : "system"},
  changeset : [{}]
});

var KabkotaLog;

try {
  KabkotaLog = mongoose.model ("KabkotaLog");
} catch (err){
  KabkotaLog = mongoose.model ("KabkotaLog", KabkotaLogSchema);
}

/**
 * The schema
 */
var KabkotaSchema = new Schema({
  name: { type : String },
});

KabkotaSchema.index({slug: 1}, {unique: true});

KabkotaSchema.set("toJSON", { getters: false });

var Kabkota;

try {
  Kabkota = mongoose.model ("Kabkota");
}
catch (err) {
  Kabkota = mongoose.model ("Kabkota", KabkotaSchema);
}

module.exports = Kabkota;
