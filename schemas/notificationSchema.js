const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    userTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    userFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notificationType: String,
    opened: { type: Boolean, default: false },
    entityId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

notificationSchema.statics.insertNotification = async (
  userTo,
  userFrom,
  notificationType,
  entityId
) => {
  const data = { userTo, userFrom, notificationType, entityId };
  await notificationModel.deleteOne(data).catch((err) => {
    console.log(err);
  });
  return notificationModel.create(data);
};
var notificationModel = mongoose.model("Notification", notificationSchema);
module.exports = notificationModel;
