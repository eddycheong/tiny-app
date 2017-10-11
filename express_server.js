const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

const urlsRouter = require("./routes/urls_router.js");

const generateRandomString = require("./lib/generate_random_string");

app.set("view engine", "ejs");
app.set("urls", urlDatabase);

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/urls', urlsRouter);

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/register", (req, res) => {
  res.render('register');
});

app.post("/register", (req, res) => {
  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", newUserId);

  console.log(users);
  res.redirect("/urls");
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