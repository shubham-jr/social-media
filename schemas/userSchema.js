const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "first name is required"],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "last name is required"],
    },
    userName: {
      type: String,
      trim: true,
      required: [true, "last name is required"],
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      requiredPaths: [true, "must have a password"],
    },
    profilePic: {
      type: String,
      default: "/images/profilePic.png",
    },
    coverPhoto: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Posts" }],
    retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Posts" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
