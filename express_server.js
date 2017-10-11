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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

const urlsRouter = require('./routes/urls_router.js');

app.set("view engine", "ejs");
app.set("urls", urlDatabase);

// app.locals.urls = urlDatabase;

// // app.use((req, res, next) => {
// //   res.locals.urls = urlDatabase;
// //   next();
// // });

app.use(bodyParser.urlencoded({extended: true}));
app.use('/urls', urlsRouter);

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]) {
    res.status(404).send(`Could not find the short URL: ${req.params.shortURL}`);
  }
  else {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});