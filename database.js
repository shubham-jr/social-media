const mongoose = require("mongoose");
class database {
  constructor() {
    this.connect();
  }
  connect() {
    mongoose
      .connect(
       DB String
      )
      .then(() => console.log("database connected"))
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = new database();
