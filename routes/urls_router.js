var generateRandomString = require('../lib/generate_random_string');

var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
  next();
});

router.get("/new", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

router.get("/:id", (req, res) => {

  let templateVars = {
    shortURL: req.params.id,
    longURL: req.app.get('urls')[req.params.id],
    username: req.cookies.username };
  res.render("urls_show", templateVars);
});

router.get("/", (req, res) => {
  let templateVars = {
    urls: req.app.get('urls'),
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

router.post("/:id/delete", (req, res) => {
  delete req.app.get('urls')[req.params.id];
  res.redirect('/urls');
});

router.post("/:id", (req, res) => {
  req.app.get('urls')[req.params.id] = req.body.editURL;
  res.redirect(`/urls/${req.params.id}`);
});


router.post("/", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  req.app.get('urls')[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

module.exports = router;
