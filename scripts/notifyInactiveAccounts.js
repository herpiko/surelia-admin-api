'use strict'
const _ = require('lodash');
const fs = require('fs');
const moment = require('moment');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const months = process.argv[2] || 6;
const db = process.env.DB || 'test';
const template = fs.readFileSync(__dirname + '/template.txt').toString();
const config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));
const smtpCredential = config.smtpCredential;
const host = process.env.HOST || 'localhost';
const async = require('async');
let opts = {};
if (process.env.USER) {
  opts.user = process.env.USER;
}
if (process.env.PASS) {
  opts.pass = process.env.PASS;
}

const Mailer = function() {
}

Mailer.prototype.sendMail = function(template, subject, emailAddress, data) {
  const transporter = nodemailer.createTransport(smtpCredential);
  for (let key in data) {
    console.log(key);
    template = template.replace('__' + key + '__', data[key]);
  }
  const mailOptions = {
    subject : subject,
    from : config.from,
    to : emailAddress,
    text : template
  }
  if (config.alwaysBcc) {
    mailOptions.bcc = config.alwaysBcc;
  }
  console.log(mailOptions);
  return new Promise(function(resolve, reject) {
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        return reject(err);
      }
      console.log(info);
      resolve(info);
    })
  })
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
    console.log(query);
    col.find(query).toArray(function(err, result){
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
        mailer.sendMail(template, 'Notifikasi', data.emailAddress, data)
          .then(function(){
            return cb();
          })
          .catch(function(err){
            // Ignore err
            return cb();
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
