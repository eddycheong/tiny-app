const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const router = require("./routes/router.js");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

// Applying the main route to our application
app.use('/', router);

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});