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

var ProvinceSchema = new Schema({
  name: { type : String },
});

var Province;

try {
  Province = mongoose.model ("Province");
} catch (err){
  Province = mongoose.model ("Province", ProvinceSchema);
}

module.exports = Province;
