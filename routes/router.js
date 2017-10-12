const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: ""
  },
  "9sm5xK": {
    longURL:"http://www.google.com",
    user_id: ""
  }
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

const generateRandomString = require('../lib/generate_random_string');

const express = require('express');
const router = express.Router();

router.use(function (req, res, next) {
  next();
});

router.get("/", (req, res) => {
  res.end("Hello!");
});

router.get("/register", (req, res) => {
  res.render('register');
});

router.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
    res.status(400).send("Could not register a new user. Either email or password is empty.");
  }

  for(const userID in users) {
    if(email === users[userID].email) {
      res.status(400).send("A user is already registered with that email");
      return;
    }
  }

  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: email,
    password: password
  };
  res.cookie("user_id", newUserId);

  res.redirect("/urls");
});

// route middleware to validate :shortURL
router.param('shortURL', (req, res, next, shortURL) => {
  const longURLExist = urlDatabase[shortURL].longURL;

  if(longURLExist) {
    next();
    return;
  }

  res.status(404);
  res.send(`Could not find the short URL: ${req.params.shortURL}`);
});

router.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

router.get("/login", (req, res) => {
  res.render('login');
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log(email, password);

  for(const userID in users) {
    const user = users[userID];
    if(user.email === email) {
      if(user.password == password) {
        res.cookie("user_id", user.id);
        res.redirect('/');
      } else {
        res.status(403).send("The password for this email is incorrect.");
      }

      return;
    }
  }

  res.status(403).send("The email user was not found.");
});

router.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

/* -----------------------------------------
  ROUTE: /urls
 ----------------------------------------- */

router.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;

  if(!user_id) {
    res.redirect("/login");
    return;
  }

  const user = users[user_id];

  const templateVars = {
    user_id: user_id
  };
  res.render("urls_new", templateVars);
});

router.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];

  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user_id: user_id };
  res.render("urls_show", templateVars);
});

router.get("/urls/", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];

  let templateVars = {
    urls: urlDatabase,
    user_id: user_id
  };
  res.render("urls_index", templateVars);
});

router.post("/urls/:id/delete", (req, res) => {
  const user_id = req.cookies.user_id;
  const shortURL = req.params.id;
  const urlOwner = urlDatabase[shortURL].user_id;

  if(user_id === urlOwner) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    return;
  }

  res.status(403);
  res.send("You are not the owner of this URL to delete it.");
});

router.post("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const shortURL = req.params.id;
  const newLongURL = req.body.editURL;
  const urlOwner = urlDatabase[shortURL].user_id;

  if(user_id === urlOwner) {
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect(`/urls/${req.params.id}`);
    return;
  }

  res.status(403);
  res.send("You are not the owner of this URL to edit it.");
});

router.post("/urls/", (req, res) => {
  const user_id = req.cookies.user_id;

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  const userURL = {};
  userURL.longURL = longURL;
  userURL.user_id = user_id;

  urlDatabase[shortURL] = userURL;
  res.redirect(`/urls/${shortURL}`);
});

router.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

module.exports = router;
