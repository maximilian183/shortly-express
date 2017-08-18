var db = require('../config');
var Click = require('./click');
var crypto = require('crypto');

var userLink = db.Model.extend({
  tableName: 'userlinks',
  hasTimestamps: true,
  clicks: function() {
    return this.hasMany(Click);
  },
  initialize: function() {
    this.on('creating', function(model, attrs, options) {

    });
  }
});

module.exports = userLink;