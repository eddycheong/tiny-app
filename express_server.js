const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

const router = require("./routes/router.js");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});