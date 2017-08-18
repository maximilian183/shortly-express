var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  initialize: function() {

    this.on('new_user', function(model, callback) {

      model.save({
        username: model.get('username'),
        password: bcrypt.hashSync(model.get('password')),
        currentsid: model.get('currentsid')
      })
      .then(function(results) {
        callback(results);
      })
      .catch(function(error){
        console.log('ERROR', error);
      });
    });

    this.on('login', function(model, callback) {
      console.log('VerifySession: ', model);
      var loginUser = model.get('username');
      var loginPass = model.get('comparePassword');
      var dbPass = model.get('password');
      var PASS_MATCH = bcrypt.compareSync(loginPass, dbPass);

      if (PASS_MATCH) {
        model.unset('comparePassword');
        model.save({
          currentsid: model.get('currentsid')
        })
        .then(function(){
          callback(PASS_MATCH);
        });
      }


    });
  }

});

module.exports = User;