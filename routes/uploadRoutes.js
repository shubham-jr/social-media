const express = require("express");
const app = express();
const Router = express.Router();
const path = require("path");
app.set("view engine", "pug");
const bodyParser = require("body-parser");
const userModel = require("./../schemas/userSchema");

Router.get("/images/:path", (req, res, next) => {
  res.sendFile(path.join(__dirname + `./../uploads/images/${req.params.path}`));
});
module.exports = Router;
