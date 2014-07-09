var helper = require ("panas").helper;
var mongoose = require ("mongoose");
var thunkified = helper.thunkified;
var async = require ("async");
var _ = require ("lodash");
var boom = helper.error;

var ResourceDomain = require ("../../resources/domain");
var Model = ResourceDomain.schemas;
var ResourceQueue = require ("../../resources/commandQueue");
var QueueModel = ResourceQueue.schemas;
var QueueCommands = ResourceQueue.enums.Commands;
var QueueStates = ResourceQueue.enums.States;

var policy = require("../../policy");
var DomainEnums = ResourceDomain.enums;
var DomainStates = DomainEnums.States;

var ObjectId = mongoose.Types.ObjectId;

var LIMIT = 10;

/**
 * Domain class
 */
function Domain (options) {
  this.options = options;
  if (!(this instanceof Domain)) return new Domain(options);
  this.name = "user";
}

Domain.prototype.find = function(ctx, options, cb) {
  var query = {
  }

  this.search (query, ctx, options, cb);
}


Domain.prototype.findActive = function(ctx, options, cb) {
  var query = {
    state: DomainStates.types.ACTIVE,
  }

  this.search (query, ctx, options, cb);
}

Domain.prototype.findInactive = function(ctx, options, cb) {
  var query = {
    state: DomainStates.types.INACTIVE,
  }

  this.search (query, ctx, options, cb);
}

Domain.prototype.findPending = function(ctx, options, cb) {
  var query = {
    state: DomainStates.types.PENDING,
  }

  this.search (query, ctx, options, cb);
}

Domain.prototype.findPendingTransaction = function(ctx, options, cb) {
  var query = {
    pendingTransaction: {
      $ne: ObjectId("000000000000000000000000")
    }
  }

  this.search (query, ctx, options, cb);
}

Domain.prototype.search = function (query, ctx, options, cb) {

  var qs = ctx.query;

  // skip, limit, sort
  var skip = qs.skip || 0;
  var limit = qs.limit || LIMIT;
  var sort = qs.sort || { _id : -1 };

  // like or exact
  var like = qs.like || {};
  var exact = qs.exact || {};
  // in
  var inOperator = qs.in || {};

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

  var task = Model.Domain.find(query, omit);
  var paths = Model.Domain.schema.paths;
  var keys = Object.keys(paths);

  task.skip (skip);
  task.limit (limit);
  task.sort (sort);

  task.sort({ modified : -1});
  task.populate("mailboxServer", "name");

  var promise = task.exec();
  promise.addErrback(cb);
  promise.then(function(retrieved){
    Model.Domain.count(query, function(err, total){

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

Domain.prototype.findOne = function (ctx, options, cb) {
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

  var task = Model.Domain.findOne(query, omit);
  var paths = Model.Domain.schema.paths;
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

Domain.prototype.create = function (ctx, options, cb) {
  var session = ctx.session;

  var body = options.body;

  if (session.user) {
    body.creator = session.user._id;
  }

  body.object = "domain";
  var createTransaction = function(next) {
     QueueModel.create({
       command: QueueCommands.types.CREATE,
       args: body,
       state: QueueStates.types.NEW,
       createdDate: new Date
     }, next); 
  }

  var register = function(err, result) {
    if (err) {
      return cb(err);
    }
    body.pendingTransaction = result._id;
    body.createdDate = new Date();
    Model.Domain.create (body, function (err, data){
      if (err) {
        QueueModel.remove({_id: result._id}, function() {
          if (err.code == 11000) {
            return cb (boom.badRequest("duplicate domain"));
          } else {
            return cb(err);
          }
        });
        return;
      }

      if (!data) {
        // boom
      }

      var object = {
        object : "domain",
      }

      var omit = ["hash", "log"];
      object = _.merge(object, data.toJSON());
      object = _.omit (object, omit);
      return cb (null, object);
    });
  }

  createTransaction(register);
}

Domain.prototype.update = function (ctx, options, cb) {

  var body = options.body;
  var id = ctx.params.id;

  Model.Domain.findById(id, function(err, data){
    if (err) {
      return cb (err);
    }

    if (!data) {
      // boom
    }

    for (var k in body) {
      if (body[k]) {
        data[k] = body[k];  
      }
    }

    delete data.log;

    data.save(function (err, user){

      if (err) return cb(boom.badRequest (err.message));

      var object = {
        object : "domain",
      }

      var omit = ["hash", "log"];
      object = _.merge(object, user.toJSON());
      object = _.omit (object, omit);
      return cb (null, object);
    });
  });
}

Domain.prototype.setState = function (state, ctx, options, cb){
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
  var task = Model.Domain.find(query);
  task.exec(function(err, data) {
    if (err) return cb (err);
    if (data && data.length > 0) {
      task.update(query,
      { 
        $set: {
          state : state
        }
      }, {
        multi : true
      }, function(err, result) {
        if (err) return cb (err);
        cb (null, {object : "domain", data : ids})
      });
    } else {
      return cb (boom.badRequest("invalid arguments"));
    }
  });
}

Domain.prototype.remove = function (ctx, options, cb){
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
  var task = Model.Domain.remove(query);
  task.exec(function(err, data) {
    if (err) return cb (err);
    cb (null, {object : "domain", data : ids})
  });

}

Domain.prototype.activate = function (ctx, options, cb){
  this.setState(DomainStates.types.ACTIVE, ctx, options, cb);
}

Domain.prototype.deactivate = function (ctx, options, cb){
  this.setState(DomainStates.types.INACTIVE, ctx, options, cb);
}

module.exports = function(options) {
  return thunkified (Domain(options));
}
