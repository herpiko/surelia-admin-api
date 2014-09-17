/**
 * Module deps
 */
var debug = require ("debug") ("api-resources-misc-schemas-province");
var mongoose = require ("mongoose");

var policy = require ("../../../policy"); // todo: using env var, or process.cwd(), make it in lib

/**
 * Shorthands
 */
var Schema = mongoose.Schema;

var KabKotaSchema = new Schema({
  name: { type : String },
  province: { type : Schema.Types.ObjectId, ref : "Province", required: true},
});

var KabKota;

try {
  KabKota = mongoose.model ("KabKota");
} catch (err){
  KabKota = mongoose.model ("KabKota", KabKotaSchema);
}

module.exports = KabKota;
