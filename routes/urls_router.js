function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateRandomString() {
  const numberSet = "0123456789";
  const characterSet = "abcdefghijklmnopqrstuvwxyz";

  const validCharacters = numberSet
    + characterSet
    + characterSet.toUpperCase();

  let generatedString = "";

  for(let i = 0; i < 6; i++) {
    generatedString += validCharacters[getRandomInt(0, validCharacters.length)];
  }

  return generatedString;
}


var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
  next();
});

router.get("/new", (req, res) => {
  res.render("urls_new");
});

router.get("/:id", (req, res) => {

  let templateVars = { shortURL: req.params.id, longURL: req.app.get('urls')[req.params.id] };
  res.render("urls_show", templateVars);
});

router.get("/", (req, res) => {
  let templateVars = { urls: req.app.get('urls') };
  res.render("urls_index", templateVars);
});

router.post("/:id/delete", (req, res) => {
  delete req.app.get('urls')[req.params.id];
  res.redirect('/urls');
});

router.post("/", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  req.app.get('urls')[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

module.exports = router;
