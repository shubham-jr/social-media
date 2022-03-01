const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Router = express.Router();
app.set("view engine", "pug");
const bodyParser = require("body-parser");
const userModel = require("./../schemas/userSchema");
const chatModel = require("./../schemas/chatSchema");

Router.get("/", (req, res, next) => {
  const payload = {
    pageTitle: "Notifications",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render("notificationsPage", payload);
});

module.exports = Router;
