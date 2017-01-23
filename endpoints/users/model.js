var helper = require ("panas").helper;
var co = require("co");
var mongoose = require ("mongoose");
var thunkified = helper.thunkified;
var async = require ("async");
var _ = require ("lodash");
var boom = helper.error;
var gearmanode = require("gearmanode");
var extend = require("util")._extend;
var csv = require("to-csv");
var moment = require("moment");
var fs = require("fs");

var Province = require ("../../resources/misc/schemas/province");
var KabKota = require ("../../resources/misc/schemas/kabkota");
var AdminActivities = require ("../../resources/misc/schemas/adminActivities");

var ResourceUser = require ("../../resources/user");
var Model = ResourceUser.schemas;
var ResourceQueue = require ("../../resources/commandQueue");
var QueueModel = ResourceQueue.schemas;
var QueueCommands = ResourceQueue.enums.Commands;
var QueueStates = ResourceQueue.enums.States;
var ResourceDomain = require ("../../resources/domain");
var DomainModel = ResourceDomain.schemas;
var ResourceServer = require ("../../resources/server");
var ServerModel = ResourceServer.schemas;

var policy = require("../../policy");
var UserEnums = ResourceUser.enums(policy);
var UserStates = UserEnums.States;

// Mailer
const Mailer = require(__dirname + '/../../scripts/mailer');
const mailerTemplate = fs.readFileSync(__dirname + '/../../scripts/templates/template_welcomeMessage.txt').toString();
const mailerConfig = JSON.parse(fs.readFileSync(__dirname + '/../../scripts/config.json'));

var Session
try{
  Session = mongoose.model ("Session", {}); 
} catch (err){
  Session = mongoose.model ("Session");
}
 
var ObjectId = mongoose.Types.ObjectId;

var LIMIT = 10;

/**
 * User class
 */
function User (options) {
  this.options = options;
  if (!(this instanceof User)) return new User(options);
  this.name = "user";
}

User.prototype.find = function(ctx, options, cb) {
  var query = {
  }

  this.search (query, ctx, options, cb);
}


User.prototype.findActive = function(ctx, options, cb) {
  var query = {
    state: UserStates.types.ACTIVE,
  }

  this.search (query, ctx, options, cb);
}

User.prototype.findInactive = function(ctx, options, cb) {
  var query = {
    state: UserStates.types.INACTIVE,
  }

  this.search (query, ctx, options, cb);
}

User.prototype.findPending = function(ctx, options, cb) {
  var query = {
    state: UserStates.types.PENDING,
  }

  this.search (query, ctx, options, cb);
}

User.prototype.findPendingTransaction = function(ctx, options, cb) {
  var query = {
    pendingTransaction: {
      $ne: ObjectId("000000000000000000000000")
    }
  }

  this.search (query, ctx, options, cb);
}
User.prototype.search = function (query, ctx, options, cb) {
  var qs = ctx.query;
  var self = this;
  var domain = ctx.params.domain;
  var session = ctx.session;
  var group;
  if (session && session.user && session.user.group) {
    group = session.user.group._id;
  }
  // skip, limit, sort
  var skip = qs.skip || 0;
  var limit = qs.limit || LIMIT;
  var sort = qs.sort || { lastUpdated : -1 };
  if (qs.oldestCreated) {
    sort = {created:1};
    limit = 1;
  }

  // like or exact
  var like = qs.like || {};
  var exact = qs.exact || {};
  var inOperator = qs.in || {};

  // expand
  var expand = qs.expand || [];
  var omit = "-secret -hash -salt -__v";

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
  // for count report
  if (qs.kabKota && qs.kabKota !== "All") {
    query["profile.organizationInfo.kabKota"] = ObjectId(qs.kabKota);
  }
  if (qs.province && qs.province !== "All") {
    query["profile.organizationInfo.province"] = ObjectId(qs.province);
  }
  var endOfMonth = function(month, year) {
    return new Date(year,month,00).getDate();
  }
  if (qs.yearCreated && !qs.monthCreated) {
    var startDate = new Date(qs.yearCreated, 00, 1, 00, 00, 01);
    var endDate = new Date(qs.yearCreated, 11, 31, 23, 59, 59);
    query["created"] = {
      $gte: startDate,
      $lt: endDate
    };
  } else if (qs.yearCreated && qs.monthCreated) {
    var month = parseInt(qs.monthCreated)-1;
    var startDate = new Date(qs.yearCreated, month, 1, 00, 00, 01);
    var endDate = new Date(qs.yearCreated, month, endOfMonth(month, qs.yearCreated), 23, 59, 59);
    query["created"] = {
      $gte: startDate,
      $lt: endDate
    };
  }
  if (qs.yearModified && !qs.monthModified) {
    var startDate = new Date(qs.yearModified, 00, 1, 00, 00, 01);
    var endDate = new Date(qs.yearModified, 11, 31, 23, 59, 59);
    query["modified"] = {
      $gte: startDate,
      $lt: endDate
    };
  } else if (qs.yearModified && qs.monthModified) {
    var month = parseInt(qs.monthModified)-1;
    var startDate = new Date(qs.yearModified, month, 1, 00, 00, 01);
    var endDate = new Date(qs.yearModified, month, endOfMonth(month, qs.yearModified), 23, 59, 59);
    query["modified"] = {
      $gte: startDate,
      $lt: endDate
    };
  }
  
  if (qs["created-date-start"] || qs["created-date-end"]){
    query["created"] = {}
    if (qs["created-date-start"]) {
      query["created"]["$gte"] = new Date(qs["created-date-start"]);
    }
    if (qs["created-date-end"]) {
      query["created"]["$lt"] = new Date(qs["created-date-end"]);
    }
  }
  if (qs["modified-date-start"] || qs["modified-date-end"]){
    query["lastUpdated"] = {}
    if (qs["modified-date-start"]) {
      query["lastUpdated"]["$gte"] = new Date(qs["modified-date-start"]);
    }
    if (qs["modified-date-end"]) {
      query["lastUpdated"]["$lt"] = new Date(qs["modified-date-end"]);
    }
  }

  if (qs.status === "active") {
    query["state"] = UserStates.types.ACTIVE
  } else if (qs.status === "inactive") {
    query["state"] = UserStates.types.INACTIVE
  }
  
  if (qs.client) {
    query["accessLog.lastClientType"] = qs.client;
  }
  
  if (qs.in && qs.in.roles) {
    query["roles"] = { "$in" : [qs.in.roles] }
  }

  if (qs.inactiveInMonths) {
    if (parseInt(qs.inactiveInMonths) === 3) {
      query["accessLog.lastActivity"] = {};
      var startDate = new Date(moment().subtract(parseInt(qs.inactiveInMonths) + 3, "months").toString());
      var endDate = new Date(moment().subtract(parseInt(qs.inactiveInMonths), "months").toString());
      query["accessLog.lastActivity"]["$gt"] = startDate;
      query["accessLog.lastActivity"]["$lt"] = endDate;
    } else if (parseInt(qs.inactiveInMonths) === 6) {
      query["accessLog.lastActivity"] = {};
      var startDate = new Date(moment().subtract(parseInt(qs.inactiveInMonths) + 6, "months").toString());
      var endDate = new Date(moment().subtract(parseInt(qs.inactiveInMonths), "months").toString());
      query["accessLog.lastActivity"]["$gt"] = startDate;
      query["accessLog.lastActivity"]["$lt"] = endDate;
    } else if (parseInt(qs.inactiveInMonths) === 12) {
      query["accessLog.lastActivity"] = {};
      var endDate = new Date(moment().subtract(parseInt(qs.inactiveInMonths), "months").toString());
      query["accessLog.lastActivity"]["$lt"] = endDate;
    }
  }

  co(function*() {
    if (!(ObjectId.isValid(domain) && typeof(domain) === "object")) {
      domain = yield self.findDomainId(domain);
      if (domain && domain._id) {
        query.domain = domain._id;
      } else {
        var obj = {
          object : "list",
          total : 0,
          count : 0,
          data : []
        }
        cb (null, obj);
       }
    }

    if (group) {
      if (group != ObjectId("100000000000000000000001") &&
          group != ObjectId("000000000000000000000000")) {
        query["group"] = group;
      }
    }
    console.log(query);
    var task = Model.User.find(query, omit).lean();
    task.populate("mailboxServer", "_id name");
    task.populate("group", "_id name");
    task.populate({
      path: "profile.organizationInfo.province", 
      select: "name",
      model: "Province"
    });
    task.populate({
      path: "profile.organizationInfo.kabKota", 
      select: "name",
      model: "KabKota"
    });

    if (!_.isEmpty(exact)) {
      task.populate({
        path: "creator", 
        select: "profile.name",
        model: "User"
      });
      task.populate({
        path: "log",
        select: "actor date",
        model: "UserLog"
      });
    }


    var paths = Model.User.schema.paths;
    var keys = Object.keys(paths);

    task.skip (skip);
    task.limit (limit);

    // sort() couldn't be executed if the result is too large
    // Since csv option will fetch all documents in user collection,
    // ignore sort()
    if (!ctx.query.csv) {
      task.sort (sort);
    }

    var promise = task.exec();
    if (qs.count) {
      Model.User.count(query, function(err, total){
        if (err) return cb (err);
        var obj = {
          total : total,
        }
        cb (null, obj);
      });
    } else {
      promise.addErrback(cb);
      promise.then(function(retrieved){
        if (!_.isEmpty(exact)) {
          var LogUser = mongoose.model ("UserLog");
          LogUser.populate(retrieved[0].log, {
            path: "actor", 
            select: "profile.name",
            model: "User"
          });
        }
        // If csv query in URL exists, export the data to CSV
        if (ctx.query && ctx.query.csv === "true") {
          var getMaps = function(callback) {
            return Model.User.find({}, {username:1}).lean().exec(function(err, users){
              // User map
              var userMap = {};
              for (var i in users) {
                userMap[users[i]._id] = users[i].username;
              }
              if (err) return callback (err);
              return DomainModel.Domain.find({}, {name:1}).lean().exec(function(err, domains){
                if (err) return callback (err);
                // Domain map
                var domainMap = {};
                for (var i in domains) {
                  domainMap[domains[i]._id] = domains[i].name;
                }
                return callback(null, {
                  userMap : userMap,
                  domainMap : domainMap
                })
              });
            });
          }
          return getMaps(function(err, maps){
            if (err) return cb(err);
            for (var i in retrieved) {
              // Instead of Object ID, assign the true value from maps.
              retrieved[i].creator = maps.userMap[retrieved[i].creator];
              retrieved[i].domain = maps.domainMap[retrieved[i].domain];

              // The user object has three levels. The iteration bellow
              // moves the key and values to the top level, convert it to flat object. 
              // So it will be easier for CSV lib to convert the object to CSV string.
              // All the Object ID (_id) should be ignored because :
              //  1. The Object ID itself is an object, could not be parsed by CSV lib
              //  2. The key value that related to the Object ID is already here.
              var nestedFields = ["profile", "group", "mailboxServer"];
              for (var k in nestedFields) {
                var field = nestedFields[k]; 
                if (retrieved[i][field]) {
                  var keys = Object.keys(retrieved[i][field]);
                  for (var j in keys) {
                    if (retrieved[i][field][keys[j]] && 
                    typeof retrieved[i][field][keys[j]] === "object" && 
                    // Ignore Object ID
                    keys[j] != "_id") {
                      var keys2 = Object.keys(retrieved[i][field][keys[j]]);
                      for (var l in keys2) {
                        if (retrieved[i][field][keys[j]][keys2[l]] && 
                        typeof retrieved[i][field][keys[j]][keys2[l]] === "object" && 
                        // Ignore Object ID
                        keys2[l] != "_id") {
                          if (retrieved[i][field][keys[j]][keys2[l]]) {
                            var keys3 = Object.keys(retrieved[i][field][keys[j]][keys2[l]]);
                            for (var m in keys3) {
                              // Ignore Object ID
                              if (keys3[m] != "_id") {
                                // Moves to top level
                                retrieved[i][keys[j] + "." + keys2[l] + "." + keys3[m]] = retrieved[i][field][keys[j]][keys2[l]][keys3[m]];
                              }
                            }
                          }
                        } else {
                          // Ignore Object ID
                          if (keys2[l] != "_id") {
                            // Moves to top level
                            retrieved[i][keys[j] + "." + keys2[l]] = retrieved[i][field][keys[j]][keys2[l]];
                          }
                        }
                      }
                    } else {
                      // Ignore Object ID
                      if (keys[j] != "_id") {
                        // Moves to top level
                        retrieved[i][keys[j]] = retrieved[i][field][keys[j]];
                      }
                    }
                  }
                  // Delete the nested key-value
                  delete(retrieved[i][field]);
                }
              }
            }
            // Convert to CSV string
            // The result should be a valid CSV
            var result = csv(retrieved);
            return cb(null, result);
          })
        }
        Model.User.count(query, function(err, total){
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
  })();
}

User.prototype.findOne = function (ctx, options, cb) {
  var self = this;
  var id = ctx.params.id;
  var domain = ctx.params.domain;
  var qs = ctx.query;

  var _id;
  var query;

  try {
    _id = mongoose.Types.ObjectId(id);
    query = { _id : _id };
  } catch (err) {
    // /api/1/users/email@host.com
    if (!domain && id.indexOf("@") > 0) {
      var email = id.split("@"); 
      id = email[0];
      domain = email[1];
    }
    query = { username: id, domain: domain };
  }

  var findOne = function(query) {
    return function(next) {
      Model.User.findOne(query, next);
    }
  }
  
  co(function*() {
    if (query.domain && !(ObjectId.isValid(query.domain) && typeof(query.domain) === "object")) {
      var domain = yield self.findDomainId(query.domain);
      if (domain && domain._id) {
        query.domain = domain._id;
      } else {
        return cb(null, {});
      }
    }

    var result = yield findOne(query);
    return cb(null, result);
  })();

}

User.prototype.create = function (ctx, options, cb) {

  var self = this;
  var body = options.body;
  body.object = "user";

  var session = ctx.session;
  var group;
  if (session && session.user && session.user.group) {
    Model.User.session = session.user._id;
    group = session.user.group._id;
  }

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

    co(function*() {
      if (!(ObjectId.isValid(body.domain) && typeof(body.domain) === "object")) {
        var domain = yield self.findDomainId(body.domain);
        if (domain && domain._id) {
          body.domain = domain._id;
        } else {
          return cb(boom.badRequest ("Bad domain"));
        }
      }

      if (!(ObjectId.isValid(body.mailboxServer) && typeof(body.mailboxServer) === "object")) {
        var mailboxServer = yield self.findServerId(body.mailboxServer);
        if (mailboxServer && mailboxServer._id) {
          body.mailboxServer = mailboxServer._id;
        } else {
          return cb(boom.badRequest ("Bad server"));
        }
      }

      if (body.group == null) {
        delete(body.group);
      }

      if (group) {
        body.group = group;
        body.domain = ctx.session.user.domain._id;
      }

      body.creator = ctx.session.user._id;
      Model.User.register (body, function (err, data){

        if (err) {
          if (err.message) {
            return cb (err.message);
          }
          return cb(err);
        }

        if (!data) {
          // boom
        }

        var object = {
          object : "user",
        }

        var omit = ["hash", "log"];
        object = _.merge(object, data.toJSON());
        object = _.omit (object, omit);
        var client = gearmanode.client({servers: self.options.gearmand});
        var job = client.submitJob("createUser", "");
        job.on("complete", function() {
          console.log("RESULT: " + job.response);
          cb(null, JSON.parse(job.response));
          client.close();
        });

        // The new user has been created, send welcome message
        DomainModel.Domain.findOne({_id:data.domain}, function(err, result) {
          const mailer = new Mailer();
          data.primaryEmailAddress = data.username+"@"+result.name;
          data.name = data.profile.name;
          mailer.sendMail(mailerTemplate, mailerConfig.subjects.welcomeMessage, data.primaryEmailAddress, data)
        });

        if (ctx.session.user.domain.name === policy.mainDomain) {
          return cb(err, object);
        }

        AdminActivities.create({
          timestamp : new Date(),
          localDomain : ctx.session.user.domain.name,
          by : ctx.session.user.username + '@' + ctx.session.user.domain.name,
          activity : 'createUser',
          data : data
        }, function(err, result){
          if (err) {
            console.log(err);
            return cb(boom.badRequest (err.message));
          }
          return cb (null, object);
        })
      });
    })();
  }

  createTransaction(register);
}

User.prototype.update = function (ctx, options, cb) {
  var self = this;
  var body = options.body;
  var id = ctx.params.id;
  
  var args = {
    method : "updateAlias",
    data : {
      alias : body.alias,
      source : body.username
    }
  };
  var createTransaction = function(next) {
     QueueModel.create({
       command: QueueCommands.types.UPDATE,
       args: args,
       state: QueueStates.types.NEW,
       createdDate: new Date
     }, next); 
  }

  Model.User.findById(id, function(err, data){
    if (err) {
      return cb (err);
    }
    var userState = data.state
    if (!data) {
      // boom
    }
    var save = function(err, result) {
      if (err) {
        return cb(err);
      }
      data.save(function (err, user){
        if (err) {
          console.log(err);
          return cb(boom.badRequest (err.message));
        }
  
        var object = {
          object : "user",
        }
  
        var omit = ["hash", "log"];
        object = _.merge(object, user.toJSON());
        object = _.omit (object, omit);
        
        var closeTransaction = function(args,cb) {
          QueueModel.findOne({
            "args.data.alias" : args.data.alias
          }, function(err, entry) {
            if (entry) {
              entry.doneDate = new Date();
              entry.state = "finished";
              //entry.output = "";
              entry.save(cb); 
            } else {
              cb();
            }
          });
        }
        
        var newJob = function(alias,source) {
          var message = {
            method : "updateAlias",
            data : {
              alias : alias,
              source : source
            }
          };
          var buf = new Buffer(JSON.stringify(message));
          var client = gearmanode.client({servers: self.options.gearmand});
          var job = client.submitJob("updateAlias", buf);
          job.on("complete", function() {
            console.log("RESULT: " + job.response);
            closeTransaction(args,function() {
              cb(null, JSON.parse(job.response)); 
            });
            client.close();
          });
        }
        
        var reply = function() {
          if (body.alias) {
            Model.User.update({_id:data._id}, { $set: {"alias" : body.alias}}, function(){
              DomainModel.Domain.findOne({_id:data.domain}, function(err, result) {
                newJob(body.source,data.username+"@"+result.name);
                return cb (null, object);
              });
            });
          } else if (data.alias && !body.alias) {
            Model.User.update({_id:data._id}, { $unset: {"alias" : data.alias}}, function(){
              newJob(data.alias,false);
              return cb (null, object);
            });
          } else {
            return cb (null, object);
          }
        }
        if (ctx.session.user.domain.name === policy.mainDomain) {
          return reply();
        }
        if (userState != data.state) {
          var activity;
          if (data.state === 'active') {
            activity = 'activateUser';
          }
          if (data.state === 'inactive') {
            activity = 'deactivateUser';
          }
          AdminActivities.create({
            timestamp : new Date(),
            localDomain : ctx.session.user.domain.name,
            by : ctx.session.user.username + '@' + ctx.session.user.domain.name,
            activity : activity,
            data : data
          }, function(err, result){
            if (err) {
              console.log(err);
              return cb(boom.badRequest (err.message));
            }
            return reply();
          })
        } else {
          reply();
        }
      });
    }

    data.session = ctx.session.user._id;
    co(function*() {
      for (var k in body) {
        if (k != "mailboxServer" && body[k]) {
          data[k] = body[k];  
        }
      }

      if (body.mailboxServer && !(ObjectId.isValid(body.mailboxServer) && typeof(body.mailboxServer) === "object")) {
        var mailboxServer = yield self.findServerId(body.mailboxServer);
        if (mailboxServer && mailboxServer._id) {
          data["mailboxServer"] = mailboxServer._id;
        } else {
          return cb(boom.badRequest ("Bad server"));
        }
      }

      if (body.password) {
        data.setPassword(body.password, function() {
          createTransaction(save);
        });
      } else {
          createTransaction(save);
      }
    })();
  });
}


User.prototype.activate = function (ctx, options, cb) {

  var body = options.body || {};
  var params = ctx.params || [];

  var secret = body.secret || params.secret;

  Model.User.activate (secret, function (err, data){

    if (err) {
      return cb (err);
    }

    if (!data) {
      // boom
    }

    var object = {
      object : "user",
      _id : data._id,
      state : data.state
    }

    return cb (null, object);

  });
}

User.prototype.remove = function (ctx, options, cb){
  if (ctx.params.id) {
    Model.User.findOne({_id : ctx.params.id}, function(err, data){
      if (err) return cb (err);
      Model.User.remove({_id : ctx.params.id}, function(err){
        if (err) return cb (err);
        reply(null, {object : "user", _id : ctx.params._id}, data);
      })
    });
  } else {
    if (Array.isArray(ctx.query.ids)) {
      Model.User.find({_id : { $in : ctx.query.ids}}, function(err, data){
        if (err) return cb (err);
        Model.User.remove({ _id: { $in : ctx.query.ids} }, function(err){
          if (err) return cb (err);
          reply(null, {object : "user", data : ctx.query.ids}, data)
        })
      });

    } else {
      return cb (boom.badRequest("invalid arguments"));
    }
  }
  var reply = function(err, obj, data) {
    // This err is always null
    if (ctx.session.user.domain.name === policy.mainDomain) {
      return cb(err, obj);
    }
    AdminActivities.create({
      timestamp : new Date(),
      localDomain : ctx.session.user.domain.name,
      by : ctx.session.user.username + '@' + ctx.session.user.domain.name,
      activity : 'removeUser',
      data : data
    }, function(err, result){
      if (err) {
        console.log(err);
        return cb(boom.badRequest (err.message));
      }
      cb(err, obj);
    })
  }
}

User.prototype.authenticate = function (ctx, options, cb) {
  
  var self = this;
  var body = options.body;
  var email = body.email;
  var password = body.password;
  var omit = options.omit || ["hash", "secret", "log"];
  var username;
  var domain;

  var id = email.split("@");

  var unauthorized = function(err) {
    return cb (boom.unauthorized ({ email : email, password : password, err : err }));
  }

  domain = id.pop();
  username = id.pop();

  co(function*() {
    if (!(ObjectId.isValid(domain) && typeof(domain) === "object")) {
      domain = yield self.findDomainId(domain);
      if (domain && domain._id) {
        domain = domain._id;
      } else {
        return unauthorized("Domain not recognized");
      }
    }

    Model.User.authenticate (username, domain, password, function (err, authenticated) {

      if (err) {
        unauthorized(err);
      }

      if (!authenticated) {
        return cb (boom.unauthorized ("not authenticated"));
      }

      var object = {
        object: "user"
      }

      object = _.merge(object, authenticated.toJSON());
      object = _.omit(object, omit);

      object.roles = authenticated.roles;

      return cb (null, object);
    });
  })();
}

User.prototype.account = function(ctx, options, cb){
  cb (null, ctx.session);
}

User.prototype.findDomainId = function(domain) {
  return function(cb) {
    DomainModel.Domain.findOne({name: domain}, cb);
  }
}

User.prototype.findServerId = function(name) {
  return function(cb) {
    ServerModel.Server.findOne({
      $or : [
        { name : name },
        { _id : name },
      ],
      type: { $in: ["mailbox"] }
    }, cb);
  }
}

User.prototype.suggest = function(ctx, options, cb) {
  var self = this;
  var name = options.body.name;
  var domain = ctx.params.domain;
  var trim = function(name) {
    var name = name.replace(/[_\-\+!\[\]{}=@#$%\^&\*\(\);:""\|<>/\?,"`\.]/g, "");
    name = name.trim();
    name = name.replace(/ +/g, ".");
    name = name.toLowerCase();

    return name;
  }

  var candidate = trim(name);
  co(function*() {
    if (!(ObjectId.isValid(domain) && typeof(domain) === "object")) {
      domain = yield self.findDomainId(domain);
    } 
    if (!name) {
      return cb(boom.badRequest ("Give me a name"));
    }
    if (!domain) {
      return cb(boom.badRequest ("Give me a domain"));
    }

    var query = Model.User.find({
      $or: [
        { username: candidate },
        {
          username: {
            $regex: "^" + candidate + "\\.[0-9]+$"  
          }
        },
      ],
      domain: domain
    }, "username");
    query.sort({username:1});
    query.exec(function(err, result) {

      var f = function(a, b) {
        if (a && b && a.username) {
          var a_i = a.username.lastIndexOf(".");
          if (a_i > 0) {
            a_num = parseInt(a.username.substr(a_i + 1));

            if (a_num < b) return -1;
            if (a_num > b) return 1;
            return 0;
          }
        }
        return 0;
      };
      result = _.sortBy(result, f);
      if (err) {
        return cb(err);
      }
      if (result.length == 0) {
        return cb(null, {username: candidate});
      }
      var entry  = result.pop();
      if (entry && 
        entry.username && 
        entry.username.indexOf(".") > 0) {
          var splits = entry.username.split(".");
          var last = splits.pop();
          if (isNaN(last)) {
            candidate += ".1";
          } else {
            candidate = splits.join(".") + "." + (parseInt(last) + 1);
          }
        } else {
          candidate += ".1";
        }
      return cb(null, {username: candidate});
    });
  })();

}

User.prototype.statByClientType = function(ctx, options, cb) {
  var obj = []
  var lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate()-30);
  Model.User.count({
    "accessLog.lastClientType":"webmail", 
    "accessLog.lastActivity" : { $gt : lastMonth }
  }, function(err, result){
    if (err) return cb (err);
    obj.push({type : "Webmail", total: parseInt(result)});
    Model.User.count({
      "accessLog.lastClientType":"imap",
      "accessLog.lastActivity" : { $gt : lastMonth }
    }, function(err, result){
      if (err) return cb (err);
      obj.push({type : "IMAP", total: parseInt(result)});
      Model.User.count({
        "accessLog.lastClientType":"pop3",
        "accessLog.lastActivity" : { $gt : lastMonth }
      }, function(err, result){
        if (err) return cb (err);
        obj.push({type : "POP3", total: parseInt(result)});
        cb (null, obj)
      });
    });
  });
}

User.prototype.statByProvince = function(ctx, options, cb) {
  // Get province list
  Province.find()
    .sort({num:1})
    .lean()
    .exec(function(err, result){
      var obj = [];
      async.eachSeries(result, function(province, cb){
        Model.User.count({"profile.organizationInfo.province" : province._id}, function(err, result){
          if (err) return cb (err);
          obj.push({name : province.name, total : parseInt(result)});
          cb();
        });
      }, function(err){
        if (err) return cb (err);
        cb (null, obj)
      })
    });
}

User.prototype.statByProvince = function(ctx, options, cb) {
  // Get province list
  Province.find()
    .sort({num:1})
    .lean()
    .exec(function(err, result){
      var obj = [];
      async.eachSeries(result, function(province, cb){
        Model.User.count({"profile.organizationInfo.province" : province._id}, function(err, result){
          if (err) return cb (err);
          obj.push({name : province.name, total : parseInt(result)});
          cb();
        });
      }, function(err){
        if (err) return cb (err);
        cb (null, obj)
      })
    });
}

User.prototype.totalUser = function(ctx, options, cb) {
  Model.User.count({}, function(err, result){
    if (err) return cb (err);
    cb(null, parseInt(result));
  });
}

User.prototype.totalOrg = function(ctx, options, cb) {
  Model.User.aggregate([
    {
      $match : {}
    },
    {
      $group : { _id : "$profile.organization" }
    }
  ], function(err, result){
    if (err) return cb (err);
    cb(null, result.length);
  });
}
  

module.exports = function(options) {
  return thunkified (User(options));
}
