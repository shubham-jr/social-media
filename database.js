const mongoose = require("mongoose");
class database {
  constructor() {
    this.connect();
  }
  connect() {
    mongoose
      .connect(
        "mongodb+srv://shubhamjr:jrshubham@cluster0.0m5tt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
      )
      .then(() => console.log("database connected"))
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = new database();
