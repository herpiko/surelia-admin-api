/**
 * Dependency modules
 */
var debug = require ("debug")("api-resources-group-fixtures-bootstrap")
var async = require ("async");

/**
 * Data
 */
var schemas = require ("../schemas");
var Group = schemas.Group;

module.exports = function (done) {
  Group.remove(done);
}
