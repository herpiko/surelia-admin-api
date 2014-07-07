/**
 * Dependency modules
 */
var debug = require ("debug")("api-resources-domain-fixtures-bootstrap")
var async = require ("async");

/**
 * Data
 */
var schemas = require ("../schemas");
var Domain = schemas.Domain;

var ResourceQueue = require ("../../../resources/commandQueue");
var QueueModel = ResourceQueue.schemas;

module.exports = function (done) {
  QueueModel.remove({}, function(err, r) {
    Domain.remove(done);
  });
}
