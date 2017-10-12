const bcrypt = require('bcrypt');
const hash = (password) => {
  return bcrypt.hashSync(password, 10);
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: "userRandomID"
  },
  "9sm5xK": {
    longURL:"http://www.google.com",
    user_id: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hash("purple-monkey-dinosaur")
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hash("dishwasher-funk")
  }
};

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

router.use(function (req, res, next) {
  next();
});

router.get("/", (req, res) => {
    const sessionUserID = req.session.user_id;

    if(sessionUserID) {
      res.redirect("/urls");
      return;
    }

    res.redirect("/login");
});

router.get("/login", (req, res) => {
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

router.get("/register", (req, res) => {
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

// TODO: DELETE, ONLY USED FOR DEBUGGING
router.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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

router.use((req, res, next) => {
  const user_id = req.session.user_id;

  if(!user_id) {
    res.status(403);
    res.send("Login or register a new account.");
    return;
  }

  res.locals.user_id = user_id;
  res.locals.email = users[user_id].email;

  next();
});

router.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

router.get("/urls/", (req, res) => {
  const user_id = req.session.user_id;

  res.locals.urls = urlsForUser(user_id);
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

router.param('id', (req, res, next, shortURL) => {
  const user_id = req.session.user_id;
  const shortUrlExist = urlDatabase[shortURL];

  let urlOwner;

  if(shortUrlExist) {
    urlOwner = urlDatabase[shortURL].user_id;
  } else {
    res.status(404);
    res.send("shortURL could not be found");
    return;
  }

  if(user_id !== urlOwner) {
    res.status(403);
    res.send("You do not have permissions to view this URL because you are not the owner.");
    return;
  }

  next();
});

router.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL };
  res.render("urls_show", templateVars);
});

router.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

router.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.editURL;

  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect(`/urls/${req.params.id}`);
  return;
});

module.exports = router;
