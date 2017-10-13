function userAuthentication(req, res, next) {
  const userID = req.session.userID;
  const urlOwner = req.url.userID;

  if(userID !== urlOwner) {
    res.status(403);
    res.send("You do not have permissions to view this URL because you are not the owner.");
    return;
  }
  next();
}

module.exports = {
  userAuthentication: userAuthentication
};