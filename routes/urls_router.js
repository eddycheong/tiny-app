var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
  next();
});

router.get("/new", (req, res) => {
  res.render("urls_new");
});

router.get("/:id", (req, res) => {

  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

router.get("/", (req, res) => {
  let templateVars = { urls: req.app.get('urls') };
  res.render("urls_index", templateVars);
});

router.post("/", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

module.exports = router;
