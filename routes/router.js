const {urlsDB, usersDB} = require("../lib/database");
const {userAuthentication} = require("./validation_router");
const {redirectLoggedIn} = require("./redirect_router");
const errorRouter = require("./error_router");

const urlDatabase = urlsDB.urls;
const users = usersDB.users;

const router = require('express').Router();

function validateShortUrl(req, res, next, shortURL) {
  const shortUrlExist = urlDatabase[shortURL];

  if(shortUrlExist) {
    req.url = urlDatabase[shortURL];

    next();
    return;
  }

  // TODO: this should be handled by the REST routes
  res.status(404);
  res.send(`Could not find the short URL: ${shortURL}`);
};

// Set session user
router.use((req, res, next) => {
  const sessionUserID = req.session.userID

  if(sessionUserID) {
    res.locals.userID = sessionUserID;
    res.locals.email = users[sessionUserID].email;
  }
  next();
});

router.get("/", redirectLoggedIn, (req, res) => {
  res.redirect("/login");
});

router.get("/login", redirectLoggedIn, (req, res) => {
  res.render('login');
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;


  const user = usersDB.findUserByEmail(email);

  if(!user) {
    res.status(403);
    res.send("The provided EMAIL or password was invalid.");
    return;
  }

  // for(const userID in users) {
  //   const user = users[userID];


    // Fragile
  if(!usersDB.comparePassword(password, user.password)) {
    res.status(403);
    res.send("The provided email or PASSWORD was invalid.");
    return;
  }
  // }

  req.session.userID = user.id;
  res.redirect('/');

});

router.get("/register", redirectLoggedIn, (req, res) => {
  res.render('register');
});

router.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
    res.status(400).send("Could not register a new user. Either email or password is empty.");
    return;
  }

  if(usersDB.hasEmail(email)) {
    res.status(400).send("A user is already registered with that email");
    return;
  }

  const newUserID = usersDB.createUser(email, password);

  req.session.userID = newUserID;
  res.redirect("/urls");
});

// route middleware to validate :shortURL
// router.param('shortURL', (req, res, next, shortURL) => {
//   const shortUrlExist = urlDatabase[shortURL];

//   if(shortUrlExist) {
//     next();
//     return;
//   }

//   res.status(404);
//   res.send(`Could not find the short URL: ${req.params.shortURL}`);
// });

router.param('id', validateShortUrl);

router.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

// This route is one the few exceptions that has to redirect if user is not logged in
// TODO: investigate if this can be better refactored
router.get("/urls/new", (req, res) => {
  const sessionUserID = req.session.userID;

  if(!sessionUserID) {
    res.redirect("/login");
    return;
  }

  // res.locals.userID = sessionUserID;
  // res.locals.email = users[sessionUserID].email;

  res.render("urls_new");
});

/* -----------------------------------------
  LOGGED-IN USER MIDDLEWARE
 ----------------------------------------- */

router.use(errorRouter.notLoggedIn);

router.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

router.get("/urls/", (req, res) => {
  const sessionUserID = req.session.userID;

  res.locals.urls = urlsDB.urlsForUser(sessionUserID);
  res.render("urls_index");
});

router.post("/urls/", (req, res) => {
  const sessionUserID = req.session.userID;
  const longURL = req.body.longURL;

  const shortURL = urlsDB.createUrlByUser(longURL, sessionUserID);
  res.redirect(`/urls/${shortURL}`);
});

/* -----------------------------------------
 AUTHENTICATION MIDDLEWARE
 ----------------------------------------- */

router.param('id', validateShortUrl);

router.get("/urls/:id", userAuthentication, (req, res) => {
  const shortURL = req.params.id;

  res.locals.shortURL = shortURL;
  res.locals.longURL = urlDatabase[shortURL].longURL;

  res.render("urls_show");
});

router.post("/urls/:id/delete", userAuthentication, (req, res) => {
  const shortURL = req.params.id;

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

router.post("/urls/:id", userAuthentication, (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.editURL;

  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

module.exports = router;
