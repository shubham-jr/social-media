const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const Router = express.Router();
const bodyParser = require("body-parser");
app.set("view engine", "pug");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
const userModel = require("./../schemas/userSchema");

Router.get("/", (req, res, next) => {
  res.status(200).render("register");
});

Router.post("/", async (req, res, next) => {
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const userName = req.body.userName.trim();
  const email = req.body.email.trim();
  const password = req.body.password;
  const payload = req.body;
  if (firstName && lastName && userName && email && password) {
    const user = await userModel
      .findOne({
        $or: [{ userName }, { email }],
      })
      .catch((err) => {
        console.log(err);
        payload.errorMessage = "Something went wrong!!!";
        res.status(200).render("register", payload);
      });
    if (!user) {
      const data = req.body;
      data.password = await bcrypt.hash(password, 12);
      userModel.create(data).then((doc) => {
        req.session.user = doc;
        return res.redirect("/");
      });
    } else {
      if (email == user.email) payload.errorMessage = "Email already in use!!!";
      else payload.errorMessage = "Username already in use!!!";
    }
  } else {
    payload.errorMessage = "Empty fields not allowed!!!";
    res.status(200).render("register", payload);
  }
});

module.exports = Router;
