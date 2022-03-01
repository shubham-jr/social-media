const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const messageModel = require("./../../schemas/messageSchema");
const chatModel = require("./../../schemas/chatSchema");
const userModel = require("../../schemas/userSchema");
const notificationModel = require("../../schemas/notificationSchema");
const Router = express.Router();
Router.post("/", async (req, res, next) => {
  if (!req.body.content || !req.body.chatId) {
    console.log("invalid data passed into request...");
    return res.sendStatus(400);
  }
  const newMessage = {
    sender: req.session.user._id,
    content: req.body.content,
    chat: req.body.chatId,
  };
  messageModel
    .create(newMessage)
    .then(async (results) => {
      results = await messageModel.populate(results, { path: "sender" });
      results = await messageModel.populate(results, { path: "chat" });
      results = await userModel.populate(results, { path: "chat.users" });
      const chat = await chatModel
        .findByIdAndUpdate(req.body.chatId, { latestMessage: results })
        .catch((err) => {
          console.log(err);
        });

      insertNotifications(chat, results);

      res.status(201).send(results);
    })
    .catch((err) => {
      console.log(err);
    });
});

const insertNotifications = (chat, message) => {
  chat.users.forEach((userId) => {
    if (userId == message.sender._id.toString()) return;
    notificationModel.insertNotification(
      userId,
      message.sender._id,
      "new message",
      message.chat._id
    );
  });
};

module.exports = Router;
