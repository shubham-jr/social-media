const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("./database");
const session = require("express-session");
const port = 3003 || process.env.PORT;
const middleware = require("./middleware");
const path = require("path");

const server = app.listen(port, () =>
  console.log("Server listening on port " + port)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});
app.set("view engine", "pug");
app.set("views", "views");
app.use(bodyParser({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "shubhamjr_@76",
    resave: true,
    saveUninitialized: false,
  })
);

const loginRoutes = require("./routes/loginRoutes");
const registerRoutes = require("./routes/registerRoutes");
const logout = require("./routes/logout");
const postRoute = require("./routes/postRoutes");

// api routes

const postApiRoute = require("./routes/api/posts");
const profileRoutes = require("./routes/profileRoutes");
const userApiRoutes = require("./routes/api/users");
const chatApiRoutes = require("./routes/api/chats");
const messageApiRoutes = require("./routes/api/messages");
const notificationApiRoutes = require("./routes/api/notifications");
const uploadRoute = require("./routes/uploadRoutes");
const searchRoute = require("./routes/searchRoutes");
const messagesRoute = require("./routes/messagesRoutes");
const notificationRoute = require("./routes/notificationRoutes");
const { Socket } = require("dgram");

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/logout", logout);
app.use("/posts", middleware.requireLogin, postRoute);
app.use("/notifications", middleware.requireLogin, notificationRoute);

app.use("/api/posts", postApiRoute);
app.use("/api/notifications", notificationApiRoutes);
app.use("/api/users", userApiRoutes);
app.use("/api/chats", chatApiRoutes);
app.use("/api/messages", messageApiRoutes);

app.use("/profile", middleware.requireLogin, profileRoutes);

app.use("/uploads", middleware.requireLogin, uploadRoute);

app.use("/search", middleware.requireLogin, searchRoute);

app.use("/messages", middleware.requireLogin, messagesRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  res.status(200).render("home", payload);
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });
  socket.on("join room", (room) => {
    socket.join(room);
  });
  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessage) => {
    const chat = newMessage.chat;
    if (!chat.users) return console.log("chat.users is not defined");
    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessage);
    });
  });
});
