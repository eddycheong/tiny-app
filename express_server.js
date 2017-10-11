const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

const router = require("./routes/router.js");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/', router);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});