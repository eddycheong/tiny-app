const generateRandomString = require("./generate_random_string");

function urlsForUser(userID) {
  const userURLs = {};

  for(const shortURL in urls) {
    if(urls[shortURL].userID === userID) {
      userURLs[shortURL] = urls[shortURL];
    }
  }

  return userURLs;
}

function createUrlByUser(longURL, userID) {
  const shortURL = generateRandomString();

  urls[shortURL] = {
    longURL: longURL,
    userID: userID
  };

  return shortURL;
}

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

module.exports = {
  data: urls,
  urlsForUser: urlsForUser,
  createUrlByUser: createUrlByUser
}
