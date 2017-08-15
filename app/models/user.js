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
        current_sid: model.get('current_sid')
      })
      .then(function(results) {
        callback(results);
      })
      .catch(function(error){
        console.log('ERROR', error);
      });
    });

    this.on('verifysession', function(model, callback) {
      console.log('VerifySession: ', model);
      var cookie_uid = model.get('username');
      var cookie_sid = model.get('comparePassword');
      var db_pass = model.get('password');

      console.log('VerifySession model: ', model);

      // console.log('bcrypt compareSync: ', bcrypt.compareSync(cookie_sid, db_pass) );

      callback(model);
    });
  }

});

module.exports = User;