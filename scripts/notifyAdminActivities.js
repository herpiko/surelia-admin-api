'use strict'

/*
  Notify admin(s) about local admin activities that related to users (create, remove, activate, deactivate).
*/

const _ = require('lodash');
const fs = require('fs');
const moment = require('moment');
const mongoose = require('mongoose');
const db = process.env.DB || 'test';
const template = fs.readFileSync(__dirname + '/template_adminActivities.txt').toString();
const config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));
const host = process.env.HOST || 'localhost';
const async = require('async');
const markdown = require('markdown').markdown;
const Mailer = require(__dirname + '/mailer');

let opts = {};
if (process.env.USER) {
  opts.user = process.env.USER;
}
if (process.env.PASS) {
  opts.pass = process.env.PASS;
}

let startDate = new Date(moment().subtract(30, 'days').toString());
let endDate = new Date(moment().toString());

if (mongoose.connection.readyState === 0) {
  mongoose.connect('mongodb://' + host + '/' + db, opts, function(err){
    if (err) {
      console.log(err);
      process.exit();
    }
  });
}
mongoose.connection.once('open', function(){
  mongoose.connection.db.collection('adminactivities', start);
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

const getAdminActivities = function(col) {
  return new Promise(function(resolve, reject) {
    let query = {
      'timestamp' : {
        '$lt' : endDate,
        '$gt' : startDate
      }
    }
    col.find(query).toArray(function(err, result){
      if (err) {
        return reject(err);
      }
      resolve(result);
    })
  })
}

const start = function(err, col) {
  if (err) {
    throw err;
    process.exit();
  }
  let map;
  getMap()
  .then(function(domainMap){
    map = domainMap;
    console.log(map);
    return getAdminActivities(col);
  })
  .then(function(result){
    if (result && result.length == 0) {
      console.log('Activities not found\nDone.');
      return process.exit();
    }

    // Build html table
    let table = '';
    for (let i in result) {
      table += '<tr>';
      table += '<td>' + result[i].localDomain + '</td>';
      table += '<td>' + result[i].by + '</td>';
      table += '<td>' + result[i].activity + '</td>';
      table += '<td>' + result[i].data.username + '@' + map[result[i].data.domain] + '</td>';
      table += '<td>' + result[i].data.profile.name + '</td>';
      table += '</tr>';
    }
    console.log(table);
    let data = {
      table : table,
      startDate : startDate.toLocaleDateString('id'),
      endDate : endDate.toLocaleDateString('id'),
    }
    let subject = 'Local Admin Activities : ' + startDate.toDateString() + ' - ' + endDate.toDateString();
    const mailer = new Mailer();
    async.eachSeries(config.adminEmails, function(email, cb){
      mailer.sendMail(template, subject, email, data)
        .then(function(){
          return cb();
        })
        .catch(function(err){
          throw err;
          process.exit();
        })
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
