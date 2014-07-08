/**
 * Dependency modules
 */
var debug = require ("debug")("api-resources-server-fixtures-bootstrap")
var async = require ("async");

/**
 * Data
 */
var schemas = require ("../schemas");
var Server = schemas.Server;

module.exports = function (done) {
  Server.remove(done);
}
