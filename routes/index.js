var express = require('express');
var router = express.Router();

/* GET output page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
  res.end();
});

module.exports = router;
