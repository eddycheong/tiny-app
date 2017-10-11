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
app.set("users", users);

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

app.get("/login", (req, res) => {
  res.render('login');
});

app.post("/login", (req, res) => {
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

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});