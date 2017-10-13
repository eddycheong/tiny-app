const bcrypt = require("bcrypt");
const generateRandomString = require("./generate_random_string");

const hash = (password) => {
  return bcrypt.hashSync(password, 10);
};

const urls = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

function createUser(email, password) {
  const newUserID = generateRandomString();

  users[newUserID] = {
    id: newUserID,
    email: email,
    password: hash(password)
  };

  return newUserID;
}

function createUrlByUser(longURL, userID) {
  const shortURL = generateRandomString();

  urls[shortURL] = {
    longURL: longURL,
    userID: userID
  };

  return shortURL;
}

function urlsForUser(userID) {
  const userURLs = {};

  for(const shortURL in urls) {
    if(urls[shortURL].userID === userID) {
      userURLs[shortURL] = urls[shortURL];
    }
  }

  return userURLs;
}

function compareEmail(email, userEmail) {
  return email === userEmail;
}

function comparePassword(password, userPassword) {
  return bcrypt.compareSync(password, userPassword);
}

function hasEmail(email) {
  for(const userID in users) {
    if(email === users[userID].email) {
      return true;
    }
  }
  return false;
}

function findUserByEmail(email) {
  // return Object.values(users).find(u => u.email === email);

  for(let userID in users) {
    if(users[userID].email === email) {
      return users[userID];
    }
  }
}

module.exports = {
  urlsDB: {
    urls: urls,
    createUrlByUser: createUrlByUser,
    urlsForUser: urlsForUser
  },
  usersDB: {
    users: users,
    createUser: createUser,
    compareEmail: compareEmail,
    comparePassword: comparePassword,
    hasEmail: hasEmail,
    findUserByEmail: findUserByEmail
  }
};