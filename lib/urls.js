const generateRandomString = require("./generate_random_string");

const Urls = {
  data: {
    "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: "userRandomID"
    },
    "9sm5xK": {
      longURL: "http://www.google.com",
      userID: "user2RandomID"
    }
  },
  urlsForUser: function(userID) {
    const urls = this.data;
    const userURLs = {};

    for(const shortURL in urls) {
      if(urls[shortURL].userID === userID) {
        userURLs[shortURL] = urls[shortURL];
      }
    }

    return userURLs;
  },
  createUrlByUser: function(longURL, userID) {
    const urls = this.data;
    const shortURL = generateRandomString();

    urls[shortURL] = {
      longURL: longURL,
      userID: userID
    };

    return shortURL;
  }
};

module.exports = Urls;
