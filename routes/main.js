var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
var WebSocket = require('ws');

// ======================================================

var generateToken = function (username) {
  return jwt.sign({ name: username}, 'MYSECRET', { expiresIn: '100m' })
};

// ====================================================================

router.post('/signup', function(req, res, next) {
  passport.authenticate('signup', (error, user, info) => {
    req.session.save((err) => {
      if (err) {
        return next(err);
      }
    });
    res.json({success: true});
  })(req, res, next);
  return;
}); // runs the passport authenticate function; config in passport.js

router.post('/login', function(req, res, next) {
  passport.authenticate('login', (error, user, info) => {
    if (error) {
      return next(error);
    }
    if (!user) {
      return res.status(403).json({ error: 'User not found.'});
    }
    req.logIn(user, err => {
      if (err) {
        return res.status(401).json({authenticated: false, message: err});
      }
      return res.json({isAuthenticated: true, token: generateToken(req.body.username)});
    });
  })(req, res, next);
}); // runs the passport authenticate function; config in passport.js

router.get('/logout', (req, res, next) => {
  req.logout();
  req.session.save((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).send('OK');
  });
});

router.post('/psalms', function(req, res) {
  console.log("POST API/psalms/");
  res.send("root of API calls regarding psalms");
});

router.post('/psalms/list', function(req, res, next) {
  var db = new sqlite3.Database('./db/testdb.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the testdb database.');
  });
  console.log("API/psalms/list POST - API call showing list of psalms or requested psalms");
  res.send();
});

module.exports = router;
