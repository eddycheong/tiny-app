const bcrypt = require("bcrypt");
const urls = require("../lib/urls");
const users = require("../lib/users");

module.exports = function(req, res, next) {
  req.db = {
    urls: urls,
    users: users
  };
  next();
};