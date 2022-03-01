const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const userModel = require("./../../schemas/userSchema");
const postModel = require("./../../schemas/PostSchema");
const { findByIdAndDelete } = require("./../../schemas/userSchema");
const chatModel = require("./../../schemas/chatSchema");
const { request } = require("express");
const messageModel = require("../../schemas/messageSchema");
const Router = express.Router();
Router.post("/", async (req, res, next) => {
  if (!req.body.users) {
    console.log("Users params not send with request...");
    return res.sendStatus(400);
  }
  const users = JSON.parse(req.body.users);
  if (users.length == 0) {
    console.log("User array is empty....");
    return res.sendStatus(400);
  }
  users.push(req.session.user);
  const chatData = { users, isGroupChat: true };
  chatModel
    .create(chatData)
    .then((chat) => {
      res.status(200).send(chat);
    })
    .catch((err) => {
      console.log(err);
    });
});

Router.get("/", async (req, res, next) => {
  chatModel
    .find({ users: { $elemMatch: { $eq: req.session.user._id } } })
    .populate("users")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      // if (
      //   req.query.unreadOnly !== undefined &&
      //   req.query.unreadOnly == "true"
      // ) {
      //   results = results.filter((r) => {
      //     !r.latestMessage.readBy.includes(req.session.user._id);
      //   });
      // }
      results = await chatModel.populate(results, {
        path: "latestMessage.sender",
      });
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
    });
});

Router.put("/:chatId", async (req, res, next) => {
  chatModel
    .findByIdAndUpdate(req.params.chatId, req.body, { new: true })
    .then((results) => {
      // console.log(results);
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
    });
});

Router.get("/:chatId", async (req, res, next) => {
  chatModel
    .findOne({
      _id: req.params.chatId,
      users: { $elemMatch: { $eq: req.session.user._id } },
    })
    .populate("users")
    .sort({ updatedAt: -1 })
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
    });
});

Router.get("/:chatId/messages", async (req, res, next) => {
  messageModel
    .find({ chat: req.params.chatId })
    .populate("sender")
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = Router;
