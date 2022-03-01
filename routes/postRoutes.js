const express = require("express");
const app = express();
const Router = express.Router();
app.set("view engine", "pug");
const bodyParser = require("body-parser");
const userModel = require("./../schemas/userSchema");

Router.get("/:id", (req, res, next) => {
  const payload = {
    pageTitle: "View Posts",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.id,
  };
  res.status(200).render("postPage", payload);
});
module.exports = Router;
