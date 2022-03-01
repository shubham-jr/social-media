const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const userModel = require("./../../schemas/userSchema");
const postModel = require("./../../schemas/PostSchema");
const notificationModel = require("./../../schemas/notificationSchema");
const { findByIdAndDelete } = require("./../../schemas/userSchema");
const Router = express.Router();
Router.get("/", async (req, res, next) => {
  const searchObj = req.query;
  if (searchObj.isReply !== undefined) {
    const isReply = searchObj.isReply == "true";
    searchObj.replyTo = { $exists: isReply };
    delete searchObj.isReply;
    // console.log(searchObj);
  }

  if (searchObj.search !== undefined) {
    searchObj.content = { $regex: searchObj.search, $options: "i" };
    delete searchObj.search;
  }
  if (searchObj.followingOnly !== undefined) {
    const followingOnly = searchObj.followingOnly == "true";
    if (followingOnly) {
      const objIds = [];
      if (!req.session.user.following) {
        req.session.user.following = [];
      }
      req.session.user.following.forEach((user) => {
        objIds.push(user);
      });
      objIds.push(req.session.user._id);
      searchObj.postedBy = { $in: objIds };
    }
    delete searchObj.followingOnly;
  }
  const results = await getPosts(searchObj);
  res.status(200).send(results);
});

Router.get("/:id", async (req, res, next) => {
  const postId = req.params.id;
  let postData = await getPosts({ _id: postId });
  postData = postData[0];
  const results = {
    postData,
  };
  if (postData.replyTo != undefined) results.replyTo = postData.replyTo;
  results.replies = await getPosts({ replyTo: postId });
  res.status(200).send(results);
});

Router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    console.log("content param is empty");
    return res.sendStatus(400);
  }
  const postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }

  postModel
    .create(postData)
    .then(async (newPost) => {
      newPost = await userModel.populate(newPost, { path: "postedBy" });
      newPost = await postModel.populate(newPost, { path: "replyTo" });
      if (newPost.replyTo != undefined) {
        await notificationModel.insertNotification(
          newPost.replyTo.postedBy,
          req.session.user._id,
          "reply",
          newPost._id
        );
      }
      res.status(201).send(newPost);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

Router.put("/:id/like", async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;
  const isLiked =
    req.session.user.likes && req.session.user.likes.includes(postId);
  const option = isLiked ? "$pull" : "$addToSet";
  req.session.user = await userModel
    .findByIdAndUpdate(
      userId,
      {
        [option]: { likes: postId },
      },
      { new: true }
    )
    .catch((err) => {
      console.log(err);
    });

  const post = await postModel
    .findByIdAndUpdate(
      postId,
      {
        [option]: { likes: userId },
      },
      { new: true }
    )
    .catch((err) => {
      console.log(err);
    });

  if (!isLiked) {
    await notificationModel.insertNotification(
      post.postedBy,
      req.session.user._id,
      "postLike",
      post._id
    );
  }
  res.status(200).send(post);
});

Router.post("/:id/retweet", async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;

  //  try and delete retweet

  const deletedPost = await postModel
    .findOneAndDelete({
      postedBy: userId,
      retweetData: postId,
    })
    .catch((err) => {
      console.log(err);
    });
  const option = deletedPost != null ? "$pull" : "$addToSet";
  let repost = deletedPost;
  if (repost == null)
    repost = await postModel
      .create({ postedBy: userId, retweetData: postId })
      .catch((err) => {
        console.log(err);
      });
  req.session.user = await userModel
    .findByIdAndUpdate(
      userId,
      {
        [option]: { retweets: repost._id },
      },
      { new: true }
    )
    .catch((err) => {
      console.log(err);
    });

  const post = await postModel
    .findByIdAndUpdate(
      postId,
      {
        [option]: { retweetUser: userId },
      },
      { new: true }
    )
    .catch((err) => {
      console.log(err);
    });

  await notificationModel.insertNotification(
    userId,
    req.session.user._id,
    "folow",
    req.session.user._id
  );

  if (!deletedPost) {
    await notificationModel.insertNotification(
      post.postedBy,
      req.session.user._id,
      "retweet",
      post._id
    );
  }

  res.status(200).send(post);
});

Router.delete("/:id", async (req, res, next) => {
  await postModel
    .findByIdAndDelete(req.params.id)
    .then(() => {
      res.sendStatus(202);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

Router.put("/:id", async (req, res, next) => {
  if (req.body.pinned !== undefined) {
    await postModel
      .updateMany({ postedBy: req.session.user }, { pinned: false })
      .catch((err) => {
        console.log(err);
        res.sendStatus(400);
      });
  }
  console.log(req.params.id);
  await postModel
    .findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

const getPosts = async (filter) => {
  let results = await postModel
    .find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({ createdAt: -1 })
    .catch((err) => {
      console.log(err);
    });
  results = await userModel
    .populate(results, {
      path: "replyTo.postedBy",
    })
    .catch((err) => {
      console.log(err);
    });
  return (results = await userModel
    .populate(results, {
      path: "retweetData.postedBy",
    })
    .catch((err) => {
      console.log(err);
    }));
};

module.exports = Router;
