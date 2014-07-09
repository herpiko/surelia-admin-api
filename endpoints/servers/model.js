var helper = require ("panas").helper;
var co = require("co");
var mongoose = require ("mongoose");
var thunkified = helper.thunkified;
var async = require ("async");
var _ = require ("lodash");
var boom = helper.error;

var ResourceServer = require ("../../resources/server");
var Model = ResourceServer.schemas;
var ResourceDomain = require ("../../resources/domain");
var DomainModel = ResourceDomain.schemas;

var policy = require("../../policy");

var ObjectId = mongoose.Types.ObjectId;

var LIMIT = 10;

/**
 * Server class
 */
function Server (options) {
  this.options = options;
  if (!(this instanceof Server)) return new Server(options);
  this.name = "user";
}

Server.prototype.find = function(ctx, options, cb) {

  var query = {};
  this.search (query, ctx, options, cb);
}

Server.prototype.findDomainId = function(domain) {
  return function(cb) {
    DomainModel.Domain.findOne({name: domain}, cb);
  }
}

Server.prototype.search = function (query, ctx, options, cb) {

  var qs = ctx.query;

  // skip, limit, sort
  var skip = qs.skip || 0;
  var limit = qs.limit || LIMIT;
  var sort = qs.sort || { _id : -1 };

  // like or exact
  var like = qs.like || {};
  var exact = qs.exact || {};

  // expand
  var expand = qs.expand || [];
  var omit = "-secret -hash -salt -__v -log";

  // for custom operation
  var operator = qs.operator || false;
  var operation = operator && qs.operation ? qs.operation : [];

  if (!operator) {

    for (var key in like) {
      query [key] = new RegExp(like[key], "i");
    }

    for (var key in exact) {
      query [key] = exact[key];
    }

  } else {
    // todo custom operation
    var criterias = [];
    _.map(operation, function (oper){
      var obj = {};
      for (var key in oper) {
        obj[key] = new RegExp(oper[key], "i");
      }
      criterias.push(obj);
    });
    query["$" + operator] = criterias;
  }

  if (options.and) {
    query = { $and : [ query, options.and ]};
  }

  var task = Model.Server.find(query, omit);
  var paths = Model.Server.schema.paths;
  var keys = Object.keys(paths);

  task.skip (skip);
  task.limit (limit);
  task.sort (sort);

  task.sort({ lastUpdated : -1});

  var promise = task.exec();
  promise.addErrback(cb);
  promise.then(function(retrieved){
    Model.Server.count(query, function(err, total){

      if (err) return cb (err);

      var obj = {
        object : "list",
        total : total,
        count : retrieved.length,
        data : retrieved
      }

      cb (null, obj);

    });
  });
}

Server.prototype.findOne = function (ctx, options, cb) {
  var self = this;
  var id = ctx.params.id;
  var qs = ctx.query;

  var _id;
  var email;
  var query;

  // expand
  var expand = qs.expand || [];
  var omit = "-secret -hash -salt -__v -log";

  try {
    _id = mongoose.Types.ObjectId(id);
    query = { _id : _id };
  } catch (err) {
    // /api/1/users/email@host.com
    query = { name : id };
  }

  var task = Model.Server.findOne(query, omit);
  var paths = Model.Server.schema.paths;
  var keys = Object.keys(paths);

  for (var i = 0; i < expand.length; i++) {
    var key = expand[i];

    if (paths[key]) {
      var options = paths[key].options || {};
      if ( typeof options.type == typeof ObjectId
        || typeof options.ref == "string"){
        task.populate(expand[i], "-__v -_w");
      }
    }
  }

  var promise = task.exec();
  promise.addErrback(cb);
  promise.then(function(retrieved){
    cb (null, retrieved);
  });
}

Server.prototype.create = function (ctx, options, cb) {
  var self = this;
  var body = options.body;

  co(function*() {
    if (body.domain && !(ObjectId.isValid(body.domain) && typeof(body.domain) === "object")) {
      var domain = yield self.findDomainId(body.domain);
      if (domain && domain._id) {
        body.domain = domain._id;
      }
    }

    body.createdDate = new Date;
    Model.Server.create (body, function (err, data){
      if (err) {
        if (err.code == 11000) {
          return cb (boom.badRequest("duplicate server"));
        } else {
          return cb(err);
        }
      }

      if (!data) {
        // boom
      }

      var object = {
        object : "server",
      }
      var omit = ["hash", "log"];
      object = _.merge(object, data.toJSON());
      object = _.omit (object, omit);
      return cb (null, object);
    });
  })();
}

Server.prototype.update = function (ctx, options, cb) {
  var body = options.body;
  var id = ctx.params.id;

  var query = Model.Server.update({_id: id}, {
    $set: body
  });
  var promise = query.exec();

  promise.then(function(data) {
    return cb (null, data);
  });
}

Server.prototype.remove = function (ctx, options, cb){

  var ids = [];
  if (ctx.params.id) {
    ids.push (ctx.params.id);
  } else {
    if (Array.isArray(ctx.query.ids)) {
      ids = ctx.query.ids;
    } else {
      return cb (boom.badRequest("invalid arguments"));
    }
  }

  var query = { _id : { $in : ids } };
  var task = Model.Server.remove(query);
  task.exec(function(err, data) {
    if (err) return cb (err);
    cb (null, {object : "server", data : ids})
  });
}

module.exports = function(options) {
  return thunkified (Server(options));
}
