function errorNotLoggedIn(req, res, next) {
  const sessionUserID = req.session.userID;
  const users = req.db.users.data;

  if(!(sessionUserID in users)) {
    res.status(403);
    res.send("Login or register a new account.");
    return;
  }

  next();
}

module.exports = {
  notLoggedIn: errorNotLoggedIn
};