var generateRandomString = require('../lib/generate_random_string');

var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
  next();
});

router.get("/new", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = req.app.get('users')[user_id];

  let templateVars = {
    username: user
  };
  res.render("urls_new", templateVars);
});

router.get("/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = req.app.get('users')[user_id];

  let templateVars = {
    shortURL: req.params.id,
    longURL: req.app.get('urls')[req.params.id],
    username: user };
  res.render("urls_show", templateVars);
});

router.get("/", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = req.app.get('users')[user_id];


  let templateVars = {
    urls: req.app.get('urls'),
    username: user
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
