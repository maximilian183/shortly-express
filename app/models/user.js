var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

/*
  [x] Post will have req => ?xxx=xxx&xxx=xxx
  [x] username and password from url params
  [ ] pass username and password in db insert method
  [ ] salt and hash password
  [ ] callback will return success (then promise) or error (catch promise)
*/

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  initialize: function() {

    this.on('pwchange', function(model) {
      console.log('Password in user.js: ', model.get('password'));
      console.log('Username in user.js: ', model.get('username'));

      // this.set('error', 'ERRRROOR!!!');

      model.save({
        username: model.get('username'),
        password: bcrypt.hashSync(model.get('password'))
      });
      console.log(model);
      console.log('initialize again...');
    });
  },
  getTableName: function() {
    console.log('tableName: ', tableName);
  }

});

module.exports = User;