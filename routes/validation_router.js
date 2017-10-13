function userAuthentication(req, res, next) {
  const user_id = req.session.user_id;
  const urlOwner = req.url.user_id;

  if(user_id !== urlOwner) {
    res.status(403);
    res.send("You do not have permissions to view this URL because you are not the owner.");
    return;
  }
  next();
}

module.exports = {
  userAuthentication: userAuthentication
};