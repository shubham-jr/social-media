const express = require("express");
const multer = require("multer");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });
const app = express();
const path = require("path");
const Router = express.Router();
const bodyParser = require("body-parser");
const userModel = require("./../../schemas/userSchema");
const postModel = require("./../../schemas/PostSchema");
const notificationModel = require("./../../schemas/notificationSchema");
const { fstat } = require("fs");
const req = require("express/lib/request");
const { setServers } = require("dns");

Router.get("/", async (req, res, next) => {
  let searchObj = req.query;
  if (req.query.search !== undefined) {
    searchObj = {
      $or: [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { userName: { $regex: req.query.search, $options: "i" } },
      ],
    };
  }
  await userModel
    .find(searchObj)
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
    });
});

Router.put("/:userId/follow", async (req, res, next) => {
  const userId = req.params.userId;
  const user = await userModel.findById(userId);
  if (user == null) return res.sendStatus(404);
  const isFollowing =
    user.followers && user.followers.includes(req.session.user._id);
  const option = isFollowing ? "$pull" : "$addToSet";
  req.session.user = await userModel
    .findByIdAndUpdate(
      req.session.user._id,
      {
        [option]: { following: userId },
      },
      { new: true }
    )
    .catch((err) => {
      console.log(err);
    });

  userModel
    .findByIdAndUpdate(
      userId,
      {
        [option]: { followers: req.session.user._id },
      },
      { new: true }
    )
    .catch((err) => {
      console.log(err);
    });
  if (!isFollowing) {
    await notificationModel.insertNotification(
      userId,
      req.session.user._id,
      "follow",
      req.session.user._id
    );
  }
  res.status(200).send(req.session.user);
});

Router.get("/:userId/following", async (req, res, next) => {
  console.log(req.params.userId);
  await userModel
    .findById(req.params.userId)
    .populate("following")
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
    });
});

Router.get("/:userId/followers", async (req, res, next) => {
  await userModel
    .findById(req.params.userId)
    .populate("followers")
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
    });
});

Router.post(
  "/profilePicture",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("no file uploaded ....");
      return res.sendStatus(400);
    }
    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../${filePath}`);
    fs.rename(tempPath, targetPath, async (err) => {
      if (err != null) {
        console.log(err);
        res.sendStatus(400);
      }
      req.session.user = await userModel.findByIdAndUpdate(
        req.session.user._id,
        {
          profilePic: filePath,
        },
        { new: true }
      );
      res.sendStatus(204);
    });
  }
);

Router.post(
  "/coverPhoto",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("no file uploaded ....");
      return res.sendStatus(400);
    }
    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../${filePath}`);
    fs.rename(tempPath, targetPath, async (err) => {
      if (err != null) {
        console.log(err);
        res.sendStatus(400);
      }
      req.session.user = await userModel.findByIdAndUpdate(
        req.session.user._id,
        {
          coverPhoto: filePath,
        },
        { new: true }
      );
      res.sendStatus(204);
    });
  }
);

module.exports = Router;
