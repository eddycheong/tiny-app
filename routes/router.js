const bcrypt = require("bcrypt");
const hash = (password) => {
  return bcrypt.hashSync(password, 10);
};

const {urlDatabase, users} = require("../lib/database");
const {userAuthentication} = require("./validation_router.js");

function redirectLoggedInUser(req, res, next) {
  const sessionUserID = req.session.user_id;

  if(sessionUserID) {
    res.redirect("/urls");
    return;
  }
  next();
}

function loggedUser(req, res, next) {
  const user_id = req.session.user_id;

  if(!user_id) {
    res.status(403);
    res.send("Login or register a new account.");
    return;
  }

  res.locals.user_id = user_id;
  res.locals.email = users[user_id].email;

  next();
}

function urlsForUser(id) {
  const userURLs = {};

  for(const shortURL in urlDatabase) {
    if(urlDatabase[shortURL].user_id === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }

  return userURLs;
}

const generateRandomString = require('../lib/generate_random_string');

const express = require('express');
const router = express.Router();

router.get("/", redirectLoggedInUser, (req, res) => {
  res.redirect("/login");
});

router.get("/login", redirectLoggedInUser, (req, res) => {
  res.render('login');
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for(const userID in users) {
    const user = users[userID];
    if(user.email === email) {
      if(bcrypt.compareSync(password, user.password)) {
        req.session.user_id = user.id;
        res.redirect('/');
      } else {
        // res.render("login", {error: ""});
        res.status(403);
        res.send("The password for this email is incorrect.");
      }

      return;
    }
  }

  res.status(403);
  res.send("The email user was not found.");
});

router.get("/register", redirectLoggedInUser, (req, res) => {
  res.render('register');
});

router.post("/register", (req, res) => {
  const email = req.body.email;
  const hashPassword = hash(req.body.password);

  if(!email || !hashPassword) {
    res.status(400).send("Could not register a new user. Either email or password is empty.");
  }

  for(const userID in users) {
    if(email === users[userID].email) {
      res.status(400).send("A user is already registered with that email");
      return;
    }
  }

  // TODO: createUser
  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: email,
    password: hashPassword
  };
  req.session.user_id = newUserId;
  res.redirect("/urls");
});

// route middleware to validate :shortURL
router.param('shortURL', (req, res, next, shortURL) => {
  const shortUrlExist = urlDatabase[shortURL];

  if(shortUrlExist) {
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

// This route is one the few exceptions that has to redirect if user is not logged in
// TODO: investigate if this can be better refactored
router.get("/urls/new", (req, res) => {
  const sessionUserID = req.session.user_id;

  if(!sessionUserID) {
    res.redirect("/login");
    return;
  }

  res.locals.user_id = sessionUserID;
  res.locals.email = users[sessionUserID].email;

  res.render("urls_new");
});

/* -----------------------------------------
  LOGGED-IN USER MIDDLEWARE
 ----------------------------------------- */

router.use(loggedUser);

router.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

router.get("/urls/", (req, res) => {
  const user_id = req.session.user_id;

  res.locals.urls = urlsForUser(user_id);
  // res.locals.urls = urlDatabase;
  res.render("urls_index");
});

router.post("/urls/", (req, res) => {
  const user_id = req.session.user_id;

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  const userURL = {};
  userURL.longURL = longURL;
  userURL.user_id = user_id;

  urlDatabase[shortURL] = userURL;
  res.redirect(`/urls/${shortURL}`);
});

/* -----------------------------------------
 AUTHENTICATION MIDDLEWARE
 ----------------------------------------- */

// Check if ShortURL is valid
function validateURL(req, res, next, shortURL) {
  const shortUrlExist = urlDatabase[shortURL];

  if(shortUrlExist) {
    req.url = urlDatabase[shortURL];

    next();
    return;
  }

  res.status(404);
  res.send("shortURL could not be found");
  return;
}

router.param('id', validateURL);

router.get("/urls/:id", userAuthentication, (req, res) => {
  const shortURL = req.params.id;

  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL };
  res.render("urls_show", templateVars);
});

router.post("/urls/:id/delete", userAuthentication, (req, res) => {
  const shortURL = req.params.id;

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

router.post("/urls/:id", userAuthentication, (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.editURL;

  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect(`/urls`);
  return;
});

module.exports = router;
