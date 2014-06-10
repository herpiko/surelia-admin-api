/**
 * Dependency modules
 */
var debug = require ("debug")("api-resources-user-fixtures-bootstrap")
var async = require ("async");

/**
 * Data
 */
var schemas = require ("../schemas");
var User = schemas.User;

module.exports = function (done) {
  User.remove(done);
}
