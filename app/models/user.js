var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  initialize: function() {

    this.on('pwchange', function(model, callback) {

      model.save({
        username: model.get('username'),
        password: bcrypt.hashSync(model.get('password'))
      })
      .then(function(results){
        callback(results);
      });
    });

    this.on('verifysession', function(model, callback) {
      console.log('VerifySession: ', model);
      callback(model);
    })
  }

});

module.exports = User;