function redirectLoggedIn(req, res, next) {
  const sessionUserID = req.session.userID;

  if(sessionUserID) {
    res.redirect("/urls");
    return;
  }
  next();
}

module.exports = {
  redirectLoggedIn: redirectLoggedIn
}