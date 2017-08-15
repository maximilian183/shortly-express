var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var currentSession;

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
// app.use(session({
//   name: 'shortly',
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: {maxAge:600000}
// }));
app.use(session({secret: 'ssshhhhh'}));


app.get('/',
function(req, res) {
  var that = this;
  currentSession = req.session;
  var cookie = req.cookies;

  if (currentSession.username === undefined) {  //When server restarts or loadbalancer forwards to new server

    new User({username: cookie.shortly_uid}).fetch()   //SELECT * from users where username ===......
    .then(function(found) {         //TRUE - return results 0 or 1
      if (found.get('current_sid') === cookie['connect.sid']) {
        console.log(`IT'S A MATCH!!!!!!  CONTINUE ON WITH YOUR SESSION`);
        res.render('index');
      } else {
        res.redirect('/signup');
      }

    })
    .catch(function(err){
      console.log('Error!!: ', err);
    });
  } else {  //when you immediately
    res.render('index');
  }
});

app.get('/create',
function(req, res) {
  res.render('index');
});

app.get('/links',
function(req, res) {
  Links.reset().fetch()
  .then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login',
function(req, res) {
  res.render('login');
});

app.post('/login',
function(req, res) {
  // this.trigger('verifysession', this, (results)=>{
  // });
  Users.reset().fetch()
  .then(function(users) {
    res.status(200).send(users.models);
  });
});


app.get('/signup',
function(req, res) {
  res.render('signup');
  // console.log('Signing Up');
  console.log('shortly_user cookie: ', req.cookies.shortly_user);
  console.log('shortly_user session: ', req.session);
  currentSession = req.session;
  // res.clearCookie('shortly_user');
  // console.log('destroying cookie: ', req.cookies.shortly_user)
});

app.post('/signup',
function(req, res) {

  currentSession = req.session;

  console.log('Cookie SID in signup: ', req.cookies['connect.sid']);
/*
  [x] Post will have req => ?xxx=xxx&xxx=xxx
  [x] username and password from url params
  [x] pass username and password in db insert method
  [x] salt and hash password
  [x] callback will return success (then promise) or error (catch promise)
*/

/*
  [x] After successful signup, redirect back to index
  []

  [] 2) Middleware checks for session cookie. ==> in express documentation
  [] 2a) If session cookie not there, then create one and, in the process created a unique id to identify this http client.
  [] 2b) In the persistent session store, initialize the session for this new client.
  [] 3) If session cookie is there, then look in the session store for the session data for this client and add that data to the request object. [revisit]
  [] 4) End of session middleware processing // destroy & logout
  [] 5) Later on in the Express processing of this http request, it gets to a matching request handler. The session data from the session store for this particular http client is already attached to the request object and available for the request handler to use.
*/

  var username = req.body.username;
  var password = req.body.password;

  new User({username: username}).fetch()
  .then(function(found) {
    if (found) {
      res.redirect('/signup');
      //console.log('User already in database: ', found);
    } else {
      this.set({'password': password});
      this.set({'current_sid': req.cookies['connect.sid']});
      var that = this;

      this.trigger('new_user', this, (results)=>{
        // console.log(results);
        currentSession.username = that.get('username');
        res.cookie('shortly_uid', that.get('username'), { maxAge: 900000, httpOnly: true });
        res.redirect('/');
      });
    }
  })
  .catch(function() {

  });
});


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;
