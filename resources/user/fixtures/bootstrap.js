/**
 * Dependency modules
 */
var debug = require ("debug")("api-resources-user-fixtures-bootstrap")
var async = require ("async");
var ResourceQueue = require ("../../../resources/commandQueue");
var QueueModel = ResourceQueue.schemas;

/**
 * Data
 */
var schemas = require ("../schemas");
var User = schemas.User;

module.exports = function (done) {
  QueueModel.remove({}, function(err, r) {
    User.remove(done);
  });
}
