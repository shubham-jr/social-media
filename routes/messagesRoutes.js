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
    pageTitle: "Inbox",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render("inboxPage", payload);
});

Router.get("/new", (req, res, next) => {
  const payload = {
    pageTitle: "New Messages",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render("newMessage", payload);
});

Router.get("/:chatId", async (req, res, next) => {
  const userId = req.session.user._id;
  const chatId = req.params.chatId;
  const isValidId = mongoose.isValidObjectId(chatId);

  const payload = {
    pageTitle: "Chat",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  if (!isValidId) {
    payload.errorMessage = `chat donot exist or you not have permission to access it`;
    return res.status(200).render("chatPage", payload);
  }
  let chat = await chatModel
    .findOne({
      _id: chatId,
      users: { $elemMatch: { $eq: userId } },
    })
    .populate("users");
  payload.chat = chat;
  if (chat == null) {
    const userFound = await userModel.findById(chatId);
    if (userFound != null) {
      //get chat using user Id
      chat = await getChatByUserId(userId, userFound._id);
    }
    if (chat == null) {
      payload.errorMessage = `chat donot exist or you not have permission to access it`;
    } else {
      payload.chat = chat;
    }
  }
  res.status(200).render("chatPage", payload);
});

const getChatByUserId = (userLoggedInId, otherUserId) => {
  return chatModel
    .findOneAndUpdate(
      {
        isGroupChat: false,
        users: {
          $size: 2,
          $all: [
            { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
            { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
          ],
        },
      },
      {
        $setOnInsert: { users: [userLoggedInId, otherUserId] },
      },
      { new: true, upsert: true }
    )
    .populate("users");
};

module.exports = Router;
