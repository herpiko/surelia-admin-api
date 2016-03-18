'use strict'
const fs = require('fs');
const nodemailer = require('nodemailer');
const config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));
const smtpCredential = config.smtpCredential;

const Mailer = function() {
}

Mailer.prototype.sendMail = function(template, subject, emailAddress, data) {
  const transporter = nodemailer.createTransport(smtpCredential);
  if (data) {
    for (let key in data) {
      template = template.replace('__' + key + '__', data[key]);
    }
  }
  const mailOptions = {
    subject : subject,
    from : config.from,
    to : emailAddress,
    html : template
  }
  if (config.alwaysBcc) {
    mailOptions.bcc = config.alwaysBcc;
  }
  console.log(mailOptions);
  return new Promise(function(resolve, reject) {
    transporter.sendMail(mailOptions, function(err, info){
      if (err) {
        console.log(err);
        return reject(err);
      }
      console.log(info);
      resolve(info);
    })
  })
}

module.exports = Mailer;
