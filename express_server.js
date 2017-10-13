const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const router = require("./routes/router.js");

const app = express();

app.set("view engine", "ejs");
app.set("port", process.env.PORT || 8080)

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  secret: process.env.SESSION_SECRET || "development"
}));

app.use(router);

const server = app.listen(app.get("port"), () => {
  const address = server.address();
  console.log(`TinyApp listening on port ${address.port}!`);
});