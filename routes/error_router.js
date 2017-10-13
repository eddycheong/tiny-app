function errorNotLoggedIn(req, res, next) {
  const sessionUserID = req.session.userID;

  if(!sessionUserID) {
    res.status(403);
    res.send("Login or register a new account.");
    return;
  }

  next();
}

module.exports = {
  notLoggedIn: errorNotLoggedIn
};