var helper = require ("panas").helper;
var co = require("co");
var mongoose = require ("mongoose");
var thunkified = helper.thunkified;
var async = require ("async");
var _ = require ("lodash");
var boom = helper.error;

var ResourceProvince = require ("../../resources/province");
var Model = ResourceProvince.schemas;

var ResourceUser = require ("../../resources/user");
var UserModel = ResourceUser.schemas;

var policy = require("../../policy");
var ProvinceEnums = ResourceProvince.enums(policy);
var ProvinceStates = ProvinceEnums.States;

var Session
try{
  Session = mongoose.model ("Session", {}); 
} catch (err){
  Session = mongoose.model ("Session");
}
 
var ObjectId = mongoose.Types.ObjectId;

var LIMIT = 10;

/**
 * Province class
 */
function Province (options) {
  this.options = options;
  if (!(this instanceof Province)) return new Province(options);
  this.name = "province";
}

Province.prototype.find = function(ctx, options, cb) {
  var id = ctx.params.id;

  var query = { };

  if (id) {
    if (!(ObjectId.isValid(id))) {
      query["slug"] = id;
    } else {
      query["_id"] = id;
    }
  }

  this.search (query, ctx, options, cb);
}

Province.prototype.search = function (query, ctx, options, cb) {

  var qs = ctx.query;
  var self = this;
  var session = ctx.session;

  // skip, limit, sort
  var skip = qs.skip || 0;
  var limit = qs.limit || LIMIT;
  var sort = qs.sort || { _id : -1 };

  // like or exact
  var like = qs.like || {};
  var exact = qs.exact || {};
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

    for (var key in inOperator) {
      query [key] = query [key] || {};
      if (_.isArray(inOperator[key])) {
        query [key]["$in"] = inOperator[key];
      } else {
        query [key]["$in"] = [inOperator[key]];
      }
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

  co(function*() {
    var task = Model.Province.find(query, omit);

    task.skip (skip);
    task.limit (limit);
    task.sort (sort);

    task.sort({ lastUpdated : -1});

    var promise = task.exec();
    promise.addErrback(cb);
    promise.then(function(retrieved){
      Model.Province.count(query, function(err, total){

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
  })();
}

Province.prototype.compose = function (ctx, options, cb) {

  var self = this;

  var session = ctx.session;
  var group;
  if (session && session.user && session.user.group) {
    group = session.user.group._id;
  }

  var data = options.body;
  if (session && session.user) {
    data.creator = session.user._id;
  } else {
    data.creator = ObjectId("000000000000");
  }

  var id = ctx.params.id || data.id;

  if (id) {
    Model.Province.findOne({_id: id}, function(err, onDisk) {
      if (err) return cb(err);
      if (onDisk) {
        var onDisk = _.merge(onDisk, data);
        onDisk.save(function(err, data) {
          if (err) return cb(err);
          data = data.toJSON();
          data = _.omit(data, ["log", "__v"]);
          cb(err, data);
        });
      } else {
        return cb(boom.notfound("Province not found"));
      }
    });
  } else {
    Model.Province.create(data, function(err, data) {
      if (err) return cb(err);
      if (!data) {
        return cb(boom.internalServerError("Province couldn't be created"));
      } else {
        data = data.toJSON();
        data = _.omit(data, ["log", "__v"]);
        cb(err, data);
      }
    });
  }
}

Province.prototype.remove = function (ctx, options, cb) {
  var self = this;

  var session = ctx.session;
  var group;
  if (session && session.user && session.user.group) {
    group = session.user.group._id;
  }

  var id = ctx.params.id || data.id;

  UserModel.User.count({"profile.organizationInfo.province" : id}, function(err, result) {
    if (err) return cb(err);
    if (result > 0) {
      return cb((new Error('This province still being used by other user(s)')).message);
    }
    Model.Province.remove({_id : ctx.params.id}, function(err){
      if (err) return cb (err);
      cb (null, {object : "province", _id : id})
    });
  })

}

module.exports = function(options) {
  return thunkified (Province(options));
}
