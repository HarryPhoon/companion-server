var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var database = require('../utils/database.js');

function getPsalms() {
  
}

function encodeToken(token, callback) {
  var encodedToken = Buffer.from(token).toString("base64");
  callback(encodedToken)
}

function generateToken (username, permission, expiration, callback) {
  var claims = {
    'sub': username,
    'perm': permission
  };
  var token = jwt.sign(claims, config.token.secret, { expiresIn: expiration });
   
  encodeToken(token, function(encodedToken) {
    if (encodedToken) {
      callback(encodedToken);
    }
  })
};

function verifyToken(token, callback) {
  token = Buffer.from(token, 'base64').toString('ascii');

  jwt.verify(token, config.token.secret, function(err, token) {
    if (err) {
      console.error(err);
      callback(false);
    }
    if (token) {
      callback(true, token);
    }
    if (!token) {
      callback(false);
    }
  })
}

var getTokenData = function(token) {
  token = Buffer.from(token).toString("ascii");
  return jwt.decode(token);
}

// ====================================================================

router.post('/signup', function(req, res, next) {
  passport.authenticate('signup', function signup(error, user, info) {
    if (error) {
      return res.status(400).json({success: false});
    }
    req.session.save((err) => {
      if (err) {
        return next(err);
      }
    });
    return res.status(200).res.json({success: true});
  })(req, res, next);
});

router.post('/login', function(req, res, next) {
  passport.authenticate('login', function login(err, user, info) {
    if (err) {
      console.error(err);
    }
    if (!user) {
      return res.status(401).json({ success: false, error: true, message: "Entered credentials are incorrect" });
    }
    req.logIn(user, function finishLogin(err)  {
      if (err) {
        return res.status(401).json({ success: false, error: true, message: err });
      }
      generateToken(req.body.username, "general", config.token.expiresIn, function(token) {
        if (token) {
          return res.status(200).json({ success: true, error: false, token: token });
        }
        return res.status(400).json({ success: false, error: true, message: "There was an error on the server."})
      });
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  req.session.save((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).send('OK');
  });
});

router.post('/guest', function(req, res) {
  var guest = req.body;
  var token = generateToken(guest.sub, guest.perm, guest.exp, function(token) {
    return res.status(200).json({ success: true, token: token });
  });
})

router.post('/verify', function(req, res) {
  var token = req.body.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "No token received"});
  }

  verifyToken(token, function(valid) {
    if (valid) {
      return res.status(200).json({ success: true });
    }
    else {
      return res.status(401).json({ success: false, message: "Received token was not valid." });
    }
  })
})

router.post('/relogin', function(req, res) {
  var token = req.body.token;
  
  jwt.verify(Buffer.from(token, 'base64').toString('ascii'), config.token.secret, {ignoreExpiration: true, maxAge: "7 days"}, function(err, token) {
    if (err) {
      console.error(err);
      return res.status(401).json({ success: false, message: "Received token was not valid."})
    }
    if (token) {
      generateToken(token.sub, token.perm, config.token.expiresIn, function(token) {
        return res.status(200).json({ success: true, token: token });
      });
    }
  });
})

router.get('/psalms', async function(req, res) {
  try {
    let query = req.query;
    let psalms = await database.selectAll("id, text", "psalms", "id");
    if (psalms) {
      if (!query.from && !query.to) {
        return res.status(200).json({ success: true, psalms: psalms})
      }
      else {
        query.from--;
        if (!query.to) {
          query.to = psalms.length;
        }
        psalms = psalms.slice(query.from, query.to);
        return res.status(200).json({ success: true, psalms: psalms });
      }
    }
  }
  catch (e) {
    console.error(e);
    return res.status(400).json({ success: false });
  }
})

module.exports = router;
