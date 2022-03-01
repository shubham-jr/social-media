const express = require("express");
const app = express();
const Router = express.Router();
app.set("view engine", "pug");
const bodyParser = require("body-parser");
const userModel = require("./../schemas/userSchema");
const bcrypt = require("bcryptjs");
app.set("views", "views");

Router.get("/", (req, res, next) => {
  res.status(200).render("login");
});
Router.post("/", async (req, res, next) => {
  const payload = req.body;
  if (req.body.logUsername && req.body.logPassword) {
    const user = await userModel
      .findOne({
        $or: [{ userName: req.body.logUsername }, { email: req.body.email }],
      })
      .catch((err) => {
        console.log(err);
        payload.errorMessage = "Something went wrong!!!";
        res.status(200).render("register", payload);
      });
    if (user) {
      const result = await bcrypt.compare(req.body.logPassword, user.password);
      console.log(result);
      if (result === true) {
        req.session.user = user;
        return res.redirect("/");
      } else {
        payload.errorMessage = "wrong username or password!!!";
        return res.status(200).render("login", payload);
      }
    }
    payload.errorMessage = "wrong credentials";
    return res.status(200).render("login", payload);
  }
  res.status(200).render("login");
});
module.exports = Router;
