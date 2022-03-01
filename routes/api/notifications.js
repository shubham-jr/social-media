const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const messageModel = require("./../../schemas/messageSchema");
const chatModel = require("./../../schemas/chatSchema");
const userModel = require("../../schemas/userSchema");
const notificationModel = require("../../schemas/notificationSchema");
const Router = express.Router();
Router.get("/", async (req, res, next) => {
  notificationModel
    .find({
      userTo: req.session.user._id,
      notificationType: { $ne: "new message" },
    })
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt: -1 })
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
    });
});

Router.put("/:id/markAsOpened", async (req, res, next) => {
  notificationModel
    .findByIdAndUpdate(req.params.id, { opened: true })
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
    });
});

Router.put("/markAsOpened", async (req, res, next) => {
  notificationModel
    .updateMany({ userTo: req.session.user._id }, { opened: true })
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = Router;
