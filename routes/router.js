const router = require('express').Router();
const {userAuthentication, validateShortUrl} = require("../middleware/validation");

// Set user session information
router.use((req, res, next) => {
  const sessionUserID = req.session.userID;
  const users = req.db.users.data;

  res.locals.userID = undefined;

  if(sessionUserID in users) {
    res.locals.userID = sessionUserID;
    res.locals.email = users[sessionUserID].email;
  }
  next();
});

router.get("/", (req, res) => {
  const sessionUserID = req.session.userID;
  if(sessionUserID) {
    res.redirect("/urls");
    return;
  }

  res.redirect("/login");
});

router.get("/login", (req, res) => {
  const sessionUserID = req.session.userID;
  if(sessionUserID) {
    res.redirect("/urls");
    return;
  }

  res.render('login');
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const users = req.db.users;

  const user = users.findUserByEmail(email);
  if(!user) {
    res.status(403);
    res.send("The provided email or password was invalid.");
    return;
  }

  if(!users.comparePassword(password, user.password)) {
    res.status(403);
    res.send("The provided email or password was invalid.");
    return;
  }

  req.session.userID = user.id;
  res.redirect('/');

});

router.get("/register", (req, res) => {
  const sessionUserID = req.session.userID;
  if(sessionUserID) {
    res.redirect("/urls");
    return;
  }

  res.render('register');
});

router.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const users = req.db.users;

  if(!email || !password) {
    res.status(400);
    res.send("Could not register a new user. Either email or password is empty.");
    return;
  }

  const user = users.findUserByEmail(email);
  if(user) {
    res.status(400);
    res.send("A user is already registered with that email");
    return;
  }

  const newUserID = users.createUser(email, password);

  req.session.userID = newUserID;
  res.redirect("/urls");
});

router.param('id', validateShortUrl);

router.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.db.urls.data[shortURL].longURL;

  res.redirect(longURL);
});

router.get("/urls/new", (req, res) => {
  const sessionUserID = req.session.userID;

  if(!sessionUserID) {
    res.redirect("/login");
    return;
  }

  res.render("urls_new");
});

/* -----------------------------------------
  LOGGED-IN USER MIDDLEWARE
 ----------------------------------------- */

router.use((req, res, next) => {
  const sessionUserID = req.session.userID;
  const users = req.db.users.data;

  if(!(sessionUserID in users)) {
    res.status(403);
    res.send("Login or register a new account.");
    return;
  }

  next();
});

router.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

router.get("/urls/", (req, res) => {
  const sessionUserID = req.session.userID;
  const urls = req.db.urls;

  res.locals.urls = urls.urlsForUser(sessionUserID);
  res.render("urls_index");
});

router.post("/urls/", (req, res) => {
  const sessionUserID = req.session.userID;
  const longURL = req.body.longURL;
  const urls = req.db.urls;

  const shortURL = urls.createUrlByUser(longURL, sessionUserID);
  res.redirect(`/urls/${shortURL}`);
});

/* -----------------------------------------
 AUTHENTICATION MIDDLEWARE
 ----------------------------------------- */

router.param('id', validateShortUrl);

router.get("/urls/:id", userAuthentication, (req, res) => {
  const shortURL = req.params.id;
  const urlsData = req.db.urls.data;

  res.locals.shortURL = shortURL;
  res.locals.longURL = urlsData[shortURL].longURL;

  res.render("urls_show");
});

router.post("/urls/:id/delete", userAuthentication, (req, res) => {
  const shortURL = req.params.id;
  const urlsData = req.db.urls.data;

  delete urlsData[shortURL];
  res.redirect("/urls");
});

router.post("/urls/:id", userAuthentication, (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.editURL;
  const urlsData = req.db.urls.data;

  urlsData[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

module.exports = router;
