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

  for(const user in users) {
    if(email === users[user].email) {
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

router.get("/u/:shortURL", (req, res) => {
  // TODO: refactor the validation by using router.params or router.params
  if(!urlDatabase[req.params.shortURL]) {
    res.status(404).send(`Could not find the short URL: ${req.params.shortURL}`);
  }
  else {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  }
});

router.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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
  const user = users[user_id];

  let templateVars = {
    user_id: user
  };
  res.render("urls_new", templateVars);
});

router.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];

  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: user };
  res.render("urls_show", templateVars);
});

router.get("/urls/", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];

  let templateVars = {
    urls: urlDatabase,
    user_id: user
  };
  res.render("urls_index", templateVars);
});

router.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

router.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.editURL;
  res.redirect(`/urls/${req.params.id}`);
});


router.post("/urls/", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

module.exports = router;
