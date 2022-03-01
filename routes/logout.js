const express = require("express");
const app = express();
const Router = express.Router();
const bodyParser = require("body-parser");
const userModel = require("./../schemas/userSchema");
const bcrypt = require("bcryptjs");

Router.get("/", (req, res, next) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  }
});

module.exports = Router;
