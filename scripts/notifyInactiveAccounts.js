'use strict'
/*
  Notify inactive user
*/

const _ = require('lodash');
const fs = require('fs');
const moment = require('moment');
const mongoose = require('mongoose');
const months = process.argv[2] || 6;
const db = process.env.DB || 'test';
const template = fs.readFileSync(__dirname + '/templates/template_notifyInactive.txt').toString();
const config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));
const host = process.env.HOST || 'localhost';
const async = require('async');
const Mailer = require(__dirname + '/mailer');

let opts = {};
if (process.env.USER) {
  opts.user = process.env.USER;
}
if (process.env.PASS) {
  opts.pass = process.env.PASS;
}

if (mongoose.connection.readyState === 0) {
  mongoose.connect('mongodb://' + host + '/' + db, opts, function(err){
    if (err) {
      console.log(err);
      process.exit();
    }
  });
}
mongoose.connection.once('open', function(){
  mongoose.connection.db.collection('users', start);
});

const getMap = function() {
  return new Promise(function(resolve, reject){
    mongoose.connection.db.collection('domains', function(err, domainCollection){
      if (err) {
        return reject(err);
      }
      domainCollection.find({}).toArray(function(err, result){
        if (err) {
          return reject(err);
        }
        var map = {};
        for (let i in result) {
          map[result[i]._id] = result[i].name;
        }
        resolve(map);
      })
    });
  })
}

const getInactiveAccounts = function(col) {
  return new Promise(function(resolve, reject) {
    var threeMonthsAgo = new Date(moment().subtract(3, 'months').toString());
    var startDate = new Date(moment().subtract(months*2, 'months').toString());
    var endDate = new Date(moment().subtract(months, 'months').toString());
    var query = {
      'accessLog.lastActivity' : {
        '$lt' : endDate
      }
    }
    if (months < 12) {
      query['accessLog.lastActivity']['$gt'] = startDate;
    }
    query['$or'] = [
      {'accessLog.lastNotified': { '$exists':false}},
      {'accessLog.lastNotified': {'$lt': threeMonthsAgo}}
    ]
    console.log(query);
    col.find(query).toArray(function(err, result){
      if (err) {
        return reject(err);
      }
      resolve(result);
    })
  })
}

const updateLastNotified = function(col, data) {
  return new Promise(function(resolve, reject) {
    var now = new Date();
    delete(data.name);
    delete(data.emailAddress);
    delete(data.primaryEmailAddress);
    delete(data.inactiveInMonths);
    if (!data.accessLog) {
      data.accessLog = {};
    }
    data.accessLog.lastNotified = now;
    col.update({_id : data._id},data, {upsert:true}, function(err, result){
      if (err) {
        return reject(err);
      }
      resolve(result);
    })
  })
}

const start = function(err, col) {
  let map;
  getMap()
  .then(function(domainMap){
    map = domainMap;
    return getInactiveAccounts(col);
  })
  .then(function(result){
    if (result && result.length == 0) {
      console.log('Inactive user not found\nDone.');
      return process.exit();
    }
    const mailer = new Mailer();
    async.eachSeries(result, function(data, cb){
      if (data.profile && data.profile.email && data.profile.name) {
        data.emailAddress = data.profile.email;
        data.name = data.profile.name;
        data.inactiveMonths = months;
        data.primaryEmailAddress = data.username + '@' + map[data.domain];
        mailer.sendMail(template, 'Inactive Account Notification', data.emailAddress, data)
          .then(function(){
            return updateLastNotified(col, data)
          })
          .then(function(){
            return cb();
          })
          .catch(function(err){
            throw err;
            process.exit();
          })
      } else {
        return cb();
      }
    }, function(err){
      console.log('Done');
      process.exit();
    })
  })
  .catch(function(err){
    throw err;
    process.exit();
  })
}
