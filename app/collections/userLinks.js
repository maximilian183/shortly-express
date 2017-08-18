var db = require('../config');
var userLink = require('../models/userLink');

var userLinks = new db.Collection();

userLinks.model = userLink;

module.exports = userLinks;