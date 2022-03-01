const express = require("express");
const app = express();
const Router = express.Router();
app.set("view engine", "pug");
const bodyParser = require("body-parser");
const userModel = require("./../schemas/userSchema");

Router.get("/", (req, res, next) => {
  const payload = createPayload(req.session.user);
  res.status(200).render("searchPage", payload);
});

Router.get("/:selectedTab", (req, res, next) => {
  const payload = createPayload(req.session.user);
  payload.selectedTab = req.params.selectedTab;
  console.log(payload.selectedTab);
  res.status(200).render("searchPage", payload);
});

const createPayload = (userLoggedIn) => {
  return {
    pageTitle: "Search",
    userLoggedIn: userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
  };
};
module.exports = Router;
