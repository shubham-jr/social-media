const express = require("express");
const app = express();
const Router = express.Router();
app.set("view engine", "pug");
const bodyParser = require("body-parser");
const userModel = require("./../schemas/userSchema");

Router.get("/", (req, res, next) => {
  const payload = {
    pageTitle: req.session.user.userName,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };
  res.status(200).render("profilePage", payload);
});

Router.get("/:userName", async (req, res, next) => {
  const payload = await getPayload(req.params.userName, req.session.user);
  res.status(200).render("profilePage", payload);
});

Router.get("/:userName/replies", async (req, res, next) => {
  const payload = await getPayload(req.params.userName, req.session.user);
  payload.selectedTab = "replies";
  res.status(200).render("profilePage", payload);
});

Router.get("/:userName/following", async (req, res, next) => {
  const payload = await getPayload(req.params.userName, req.session.user);
  payload.selectedTab = "following";
  res.status(200).render("followersAndFollowing", payload);
});

Router.get("/:userName/followers", async (req, res, next) => {
  const payload = await getPayload(req.params.userName, req.session.user);
  payload.selectedTab = "followers";
  res.status(200).render("followersAndFollowing", payload);
});

const getPayload = async (userName, userLoggedIn) => {
  let user = await userModel.findOne({ userName });
  if (user == null) {
    user = await userModel.findById(userName);
    if (user == null) {
      return {
        pageTitle: "User not found...",
        userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
      };
    }
  }

  return {
    pageTitle: user.userName,
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user,
  };
};
module.exports = Router;
