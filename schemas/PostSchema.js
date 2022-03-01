const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pinned: Boolean,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    retweetUser: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    retweetData: { type: mongoose.Schema.Types.ObjectId, ref: "Posts" },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Posts" },
    pinned: Boolean,
  },
  { timestamps: true }
);
const postModel = mongoose.model("Posts", PostSchema);
module.exports = postModel;
