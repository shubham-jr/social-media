const express = require("express");
const app = express();
const mongoose = require("./../database");
const port = 3003 || process.env.PORT;
const path = require("path");
const messageModel = require("./../schemas/messageSchema");

const server = app.listen(port, () =>
  console.log("Server listening on port " + port)
);

const deleteAll = async () => {
  await messageModel.remove({}).then(() => {
    console.log("deleted");
  });
  process.exit();
};

deleteAll();
