/**
 * Module deps
 */
var debug = require ("debug") ("api-resources-commandqueue-schemas-commandqueue");
var mongoose = require ("mongoose");
var _ = require ("lodash");

var policy = require ("../../../policy"); // todo: using env var, or process.cwd(), make it in lib
var enums = require ("../enums");
var Commands = enums.Commands;
var States = enums.States;

/**
 * Shorthands
 */
var Schema = mongoose.Schema;

/**
 * The commandQueue schema
 */
var CommandQueueSchema = new Schema({
  command : { type : String, enum : Commands.enum, required: true },
  args : { type : Object, enum : Commands.enum, required: true },
  state : { type : Object, enum : States.enum, required: true },
  result : { type : Object, enum : States.enum },
  createdDate : { type : Date, required: true },
  pid : { type : Number },
  doneDate : { type : Date },
});

try {
  CommandQueue = mongoose.model ("CommandQueue");
}
catch (err) {
  CommandQueue = mongoose.model ("CommandQueue", CommandQueueSchema);
}

module.exports = CommandQueue;
