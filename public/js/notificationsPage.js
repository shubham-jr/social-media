$(document).ready((event) => {
  $.get("/api/notifications", (data) => {
    outputNotificationList(data, $(".resultsContainer"));
  });
});

$("#markNotificationsAsRead").click(() => {
  markNotificationAsOpened();
});

const outputNotificationList = (notifications, container) => {
  notifications.forEach((notification) => {
    const html = createNotificationHtml(notification);
    container.append(html);
  });
  if (notifications.length == 0)
    container.append("<span class='noResults'>Nothing to show</span>");
};

const createNotificationHtml = (notification) => {
  const userFrom = notification.userFrom;
  const text = getNotificationText(notification);
  const href = getNotificationUrl(notification);
  const className = notification.opened ? "" : "active";
  return `<a href="${href}" class="resultListItem notification ${className}" data-id="${notification._id}">
  <div class="resultsImageContainer">
  <img src="${userFrom.profilePic}">
  </div>
  <div class="resultsDetailsContainer">
  <span class="ellipsis">${text}</span>
  </div>
  </a>`;
};

const getNotificationText = (notification) => {
  const userFrom = notification.userFrom;
  if (!userFrom.firstName || !userFrom.lastName) {
    alert("data not populated...");
    return;
  }
  const userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
  let text;
  if (notification.notificationType == "retweet") {
    text = `${userFromName} retweeted your post `;
  } else if (notification.notificationType == "postLike") {
    text = `${userFromName} liked your post `;
  } else if (notification.notificationType == "reply") {
    text = `${userFromName} replied to your post `;
  } else if (notification.notificationType == "follow") {
    text = `${userFromName} started following you`;
  }
  return `<span class="ellipsis">${text}</span>`;
};

const getNotificationUrl = (notification) => {
  let url = "#";
  if (
    notification.notificationType == "retweet" ||
    notification.notificationType == "postLike" ||
    notification.notificationType == "reply"
  ) {
    url = `/posts/${notification.entityId}`;
  } else if (notification.notificationType == "follow") {
    url = `/profile/${notification.entityId}`;
  }
  return url;
};
