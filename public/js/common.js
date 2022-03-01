let cropper;

let timer;

let selectedUsers = [];

$("#postTextarea,#replyTextarea").keyup((event) => {
  const textBox = $(event.target);
  const value = textBox.val().trim();
  const isModel = textBox.parents(".modal").length == 1;
  const submitButton = isModel
    ? $("#submitReplyButton")
    : $("#submitPostButton");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }
  submitButton.prop("disabled", false);
});

$("#submitPostButton, #submitReplyButton").click((event) => {
  const button = $(event.target);
  const isModel = button.parents(".modal").length == 1;
  const textBox = isModel ? $("#replyTextarea") : $("#postTextarea");
  const data = {
    content: textBox.val(),
  };
  if (isModel) {
    const id = button.data().id;
    if (id == null) alert("id is null");
    data.replyTo = id;
  }
  $.post("/api/posts", data, (postData, status, xhr) => {
    if (postData.replyTo) {
      location.reload();
    } else {
      const html = createPostHtml(postData);
      $(".postContainer").prepend(html);
      textBox.val("");
      button.prop("disabled", true);
    }
  });
});

$("#replyModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElemet(button);
  $("#submitReplyButton").data("id", postId);
  $.get("/api/posts/" + postId, (results) => {
    outputPosts(results.postData, $("#originalPostContainer"));
  });
});

$("#replyModal").on("hidden.bs.modal", (event) => {
  $("#originalPostContainer").html("");
});

$("#deletePostModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElemet(button);
  $("#deletePostButton").data("id", postId);
});

$("#confirmPinModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElemet(button);
  $("#pinPostButton").data("id", postId);
});

$("#unpinModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElemet(button);
  $("#unpinPostButton").data("id", postId);
});

$("#deletePostButton").click((event) => {
  const postId = $(event.target).data("id");
  $.ajax({
    url: `/api/posts/${postId}`,
    type: "delete",
    success: (postData) => {
      location.reload();
    },
  });
});

$("#pinPostButton").click((event) => {
  const postId = $(event.target).data("id");
  $.ajax({
    url: `/api/posts/${postId}`,
    type: "put",
    data: { pinned: true },
    success: (postData) => {
      location.reload();
    },
  });
});

$("#unpinPostButton").click((event) => {
  const postId = $(event.target).data("id");
  $.ajax({
    url: `/api/posts/${postId}`,
    type: "put",
    data: { pinned: false },
    success: (postData) => {
      location.reload();
    },
  });
});

$("#filePhoto").change(function (event) {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = document.getElementById("imagePreview");
      image.src = e.target.result;
      if (cropper !== undefined) {
        cropper.destroy();
      }
      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false,
      });
    };
    reader.readAsDataURL(this.files[0]);
  }
});

$("#coverPhoto").change(function (event) {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = document.getElementById("coverPreview");
      image.src = e.target.result;
      if (cropper !== undefined) {
        cropper.destroy();
      }
      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false,
      });
    };

    reader.readAsDataURL(this.files[0]);
  }
});

$("#imageUploadButton").click(() => {
  const canvas = cropper.getCroppedCanvas();
  if (canvas == null) {
    alert("could not upload image.make sure it is an image file");
    return;
  }
  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append("croppedImage", blob);
    $.ajax({
      url: "/api/users/profilePicture",
      type: "post",
      data: formData,
      processData: false,
      contentType: false,
      success: () => {
        location.reload();
      },
    });
  });
});

$("#coverPhotoButton").click(() => {
  const canvas = cropper.getCroppedCanvas();
  if (canvas == null) {
    alert("could not upload image.make sure it is an image file");
    return;
  }
  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append("croppedImage", blob);
    $.ajax({
      url: "/api/users/coverPhoto ",
      type: "post",
      data: formData,
      processData: false,
      contentType: false,
      success: () => {
        location.reload();
      },
    });
  });
});

$("#userSearchTextBox").keydown((event) => {
  clearTimeout(timer);
  const textBox = $(event.target);
  let value = textBox.val();
  if (value == "" && (event.which == 8 || event.keyCode == 8)) {
    selectedUsers.pop();
    updateSelectedUserHtml();
    $(".resultsContainer").html("");
    if (selectedUsers.length == 0) {
      $("#createChatButton").prop("disabled", true);
    }
    return;
  }
  timer = setTimeout(() => {
    value = textBox.val().trim();
    if (value === null) $(".resultsContainer").html("");
    else {
      searchUsers(value);
    }
  }, 1000);
});

$("#createChatButton").click(() => {
  const data = JSON.stringify(selectedUsers);
  $.post("/api/chats", { users: data }, (chat) => {
    window.location.href = `/messages/${chat._id}`;
  });
});

$(document).on("click", ".likeButton", (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElemet(button);
  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: "PUT",
    success: (postData) => {
      button.find("span").text(postData.likes.length || "");
      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".retweetButton", (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElemet(button);
  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: "POST",
    success: (postData) => {
      button.find("span").text(postData.retweetUser.length || "");
      if (postData.retweetUser.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".post", (event) => {
  const element = $(event.target);
  const postId = getPostIdFromElemet(element);
  if (postId != undefined && !element.is("button"))
    window.location.href = "/posts/" + postId;
});

$(document).on("click", ".followButton", (event) => {
  const button = $(event.target);
  const userId = button.data().user;
  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: "PUT",
    success: (data, status, xhr) => {
      if (xhr.status == 404) alert("user not found..");
      let difference = 1;
      if (data.following && data.following.includes(userId)) {
        button.addClass("following");
        button.text("Following");
      } else {
        button.removeClass("following");
        button.text("Follow");
        difference = -1;
      }
      const followersLabel = $("#followersValue");
      if (followersLabel.length != 0) {
        let followersText = followersLabel.text();
        followersText = parseInt(followersText);
        followersLabel.text(followersText + difference);
      }
    },
  });
});

$(document).on("click", ".notification.active", (event) => {
  const container = $(event.target);
  const notificationId = container.data().id;
  const href = container.attr("href");
  event.preventDefault();
  const callback = () => {
    window.location = href;
  };
  markNotificationAsOpened(notificationId, callback);
});

const getPostIdFromElemet = (element) => {
  const isRoot = element.hasClass("post");
  const rootElement = isRoot ? element : element.closest(".post");
  const postId = rootElement.data().id;
  if (postId === undefined) return alert("postId undefined");
  return postId;
};

const createPostHtml = (postData, largeFont = false) => {
  if (postData == null) alert("post object is null");
  const isRetweet = postData.retweetData != undefined;
  const retweetedBy = isRetweet ? postData.postedBy.userName : null;
  postData = isRetweet ? postData.retweetData : postData;
  console.log(postData.content);

  const postedBy = postData.postedBy;
  const displayname = `${postedBy.firstName} ${postedBy.lastName}`;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));
  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";
  const retweetButtonActiveClass = postData.retweetUser.includes(
    userLoggedIn._id
  )
    ? "active"
    : "";
  const largeFontClass = largeFont ? "largeFont" : "";
  let retweetText = "";
  if (isRetweet) {
    retweetText = `<span>
    <i class="fas fa-retweet"></i>
    <a href='/profile/${retweetedBy}'> Retweeted by @${retweetedBy}</a></span>`;
  }

  let replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) {
    console.log(postData.replyTo);
    if (!postData.replyTo._id) {
      return alert("reply to this is not populated");
    }
    const replyToUsername = postData.replyTo.postedBy.userName;
    replyFlag = `<div class="replyFlag">
    Replying To <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
    </div>`;
  }

  let buttons = "";
  let pinnedPostText = "";
  if (postData.postedBy._id == userLoggedIn._id) {
    let pinnedClass = "";
    let dataTarget = "#confirmPinModal";
    if (postData.pinned === true) {
      dataTarget = "#unpinModal";
      pinnedClass = "active";
      pinnedPostText =
        "<i class='fas fa-thumbtack'></i> <span>Pinned Post</span>";
    }
    console.log(pinnedClass, postData.content);
    buttons = `<button class= "pinButton ${pinnedClass}" data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="${dataTarget}"><i class="fas fa-thumbtack"></i></button> 
    <button data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="#deletePostModal"><i class="fas fa-times"></i></button>`;
  }
  return `<div class="post ${largeFontClass}" data-id="${postData._id}">
  <div class="postActionContainer">${retweetText}</div>
  <div class="mainContentContainer">
  <div class="userImageContainer">
  <img src="${postedBy.profilePic}">
  </div>
  <div class="postContentContainer">
  <div class='pinnedPostText'>${pinnedPostText}</div>
  <div class="header">
  <a href="/profile/${postedBy.userName}" class="displayName">${displayname}</a>
  <span class="username">@${postedBy.userName}</span>
  <span class="date">${timestamp}</span>
  ${buttons}
  </div>
  ${replyFlag}
  <div class="postBody">
  <span>${postData.content}</span>
  </div>
  <div class="postFooter">
  <div class="postButtonContainer">
  <button data-bs-toggle="modal" data-bs-target="#replyModal">
  <i class="far fa-comment"></i>
  </button>
  </div>
  <div class="postButtonContainer green">
  <button class ="retweetButton ${retweetButtonActiveClass}">
  <i class="fas fa-retweet"></i>
  <span>${postData.retweetUser.length || ""}</span>
  </button>
  </div>
  <div class="postButtonContainer red">
  <button class="likeButton ${likeButtonActiveClass}">
  <i class="far fa-heart"></i>
  <span>${postData.likes.length || ""}</span>
  </button>
  </div>
  </div>
  </div>
  </div>
  </div>`;
};

const outputUsers = (results, container) => {
  container.html("");
  results.forEach((results) => {
    const html = createUserHtml(results, true);
    container.append(html);
  });
  if (results.length === 0)
    container.append(`<span class='noResults'>no results found</span>`);
};

const createUserHtml = (userData, showFollowButton) => {
  const name = userData.firstName + " " + userData.lastName;
  let followButton = "";
  const isFollowing =
    userLoggedIn.following && userLoggedIn.following.includes(userData._id);
  const text = isFollowing ? "Following" : "Follow";
  const buttonClass = isFollowing ? "followButton following" : "followButton";
  if (showFollowButton && userLoggedIn._id != userData._id)
    followButton = `<div class="followButtonContainer">
    <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
    </div>`;
  return `
  <div class="user">
  <div class="userImageContainer">
  <img src='${userData.profilePic}'>
  </div>
  <div class="userDetailsContainer">
  <div class="header">
  <a href='/profile/${userData.userName}'>${name}</a>
  <span class="username">@${userData.userName}</span>
  </div>
  </div>
  ${followButton}
  </div>

  `;
};

const timeDifference = (current, previous) => {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "just now";
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
};

const outputPosts = (results, container) => {
  container.html("");
  console.log(results, container);
  if (!Array.isArray(results)) {
    results = [results];
  }
  results.forEach((results) => {
    const html = createPostHtml(results);
    container.append(html);
  });
  if (results.length == null)
    container.append("<span class='no-results'>Nothing to show</span>");
};

const outputPostsWithReplies = (results, container) => {
  container.html("");
  if (results.replyTo != undefined && results.replyTo._id) {
    const html = createPostHtml(results.replyTo);
    container.append(html);
  }

  const mainPostHtml = createPostHtml(results.postData);
  container.append(mainPostHtml);

  results.replies.forEach((results) => {
    const html = createPostHtml(results, true);
    container.append(html);
  });
  if (results.length == null)
    container.append("<span class='no-results'>Nothing to show</span>");
};

const searchUsers = (searchTerm) => {
  $.get("/api/users", { search: searchTerm }, (results) => {
    outputSelectableUsers(results, $(".resultsContainer"));
  });
};

const outputSelectableUsers = (results, container) => {
  container.html("");
  results.forEach((results) => {
    if (
      results._id === userLoggedIn._id ||
      selectedUsers.some((u) => {
        return u._id == results._id;
      })
    ) {
      return;
    }
    const html = createUserHtml(results, false);
    const element = $(html);
    element.click(() => {
      userSelected(results);
    });
    container.append(element);
  });
  if (results.length === 0)
    container.append(`<span class='noResults'>no results found</span>`);
};

const userSelected = (user) => {
  selectedUsers.push(user);
  updateSelectedUserHtml();
  $("#userSearchTextBox").val("").focus();
  $(".resultsContainer").html("");
  $("#createChatButton").prop("disabled", false);
};

const updateSelectedUserHtml = () => {
  const elements = [];
  selectedUsers.forEach((user) => {
    const name = user.firstName + " " + user.lastName;
    const userElement = $(`<span class='selectedUser'>${name}</span>`);
    elements.push(userElement);
  });
  $(".selectedUser").remove();
  $("#selectedUsers").prepend(elements);
};

const getChatName = (chatData) => {
  let chatName = chatData.chatName;
  if (!chatName) {
    const otherChatUsers = getOtherChatUsers(chatData.users);
    const namesArray = otherChatUsers.map((user) => {
      return `${user.firstName} ${user.lastName}`;
    });
    chatName = namesArray.join(", ");
  }
  return chatName;
};

const getOtherChatUsers = (users) => {
  if (users.lenght == 1) {
    return users;
  }
  return Object.values(users).filter((user) => {
    return user._id != userLoggedIn._id;
  });
};

const messageRecieved = (newMesssage) => {
  if ($(".chatContainer").lenght == 0) {
  } else {
    addChatMessageHtml(newMesssage);
  }
};

const markNotificationAsOpened = (notificationId = null, callback = null) => {
  console.log(notificationId);
  if (callback == null) {
    callback = () => {
      location.reload();
    };
  }
  const url =
    notificationId != null
      ? `/api/notifications/${notificationId}/markAsOpened`
      : `/api/notifications/markAsOpened`;
  $.ajax({
    url,
    type: "put",
    success: callback,
  });
};
// const refreshMessagesBadge = () => {
//   $.get("/api/chats", { unreadOnly: true }, (data) => {
//     console.log(data.lenght);
//   });
// };
