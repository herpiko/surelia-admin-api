/**
 * Dependency modules
 */
var debug = require ("debug")("api-resources-pages-fixtures-bootstrap")
var async = require ("async");
var ResourceQueue = require ("../../../resources/commandQueue");
var QueueModel = ResourceQueue.schemas;

/**
 * Data
 */
var schemas = require ("../schemas");
var Kabkota = schemas.Kabkota;

module.exports = function (done) {
  QueueModel.remove({}, function(err, r) {
    Kabkota.remove(done);
  });
}
