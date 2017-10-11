const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
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
app.use(cookieParser());
app.use('/urls', urlsRouter);

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/register", (req, res) => {
  res.render('register');
  res.end("Okay");
});

app.get("/u/:shortURL", (req, res) => {
  // TODO: refactor the validation by using app.params or router.params
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

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});