function userAuthentication(req, res, next) {
  const userID = req.session.userID;
  const urlOwner = req.url.userID;

  if(userID !== urlOwner) {
    res.status(403);
    res.render("403", {
      status: 403,
      error: "You do not have permissions to view this URL because you are not the owner."
    });
    return;
  }
  next();
}

function validateShortUrl(req, res, next, shortURL) {
  const shortUrlExist = req.db.urls.data[shortURL];

  if(shortUrlExist) {
    req.url = req.db.urls.data[shortURL];

    next();
    return;
  }

  res.status(404);
  res.render("404", {
      status: 404,
      error: `Could not find the short URL: ${shortURL}`
    });
}

module.exports = {
  userAuthentication: userAuthentication,
  validateShortUrl: validateShortUrl
};