$(document).ready(() => {
  $.get("/api/chats", (data, status, xhr) => {
    if (xhr.status === 400) {
    } else {
      outputChatList(data, $(".resultsContainer"));
    }
  });
});

const outputChatList = (chatList, chatListContainer) => {
  chatList.forEach((chat) => {
    const html = createChatHtml(chat);
    chatListContainer.append(html);
  });
  if (chatList.lenght == 0) {
    chatListContainer.append(
      "<span class='norResults'>no results found</span>"
    );
  }
};

const createChatHtml = (chatData) => {
  const chatName = getChatName(chatData);
  const image = getChatImageElements(chatData);
  const latestMessage = getLatestMessage(chatData.latestMessage);
  return `<a href="/messages/${chatData._id}" class="resultListItem">
  ${image}
  <div class="resultsDetailsContainer elipsis">
  <span class="heading elipsis">${chatName}</span>
  <span class="subText elipsis">${latestMessage}</span>
  </div>
  </a>`;
};

const getLatestMessage = (latestMessage) => {
  console.log("lm", Object.keys(latestMessage));
  if (Object.keys(latestMessage).length > 0) {
    const sender = latestMessage[0].sender;
    console.log("sender", sender);
    return `${sender.firstName} ${sender.lastName}: ${latestMessage[0].content}`;
  }
  return `nothing new`;
};

const getChatImageElements = (chatData) => {
  const otherChatUsers = getOtherChatUsers(chatData.users);

  let groupChatClass = "";
  let chatImage = getUserChatImageElement(otherChatUsers[0]);
  if (otherChatUsers.length > 1) {
    groupChatClass = "groupChatImage";
    chatImage += getUserChatImageElement(otherChatUsers[1]);
  }
  return `<div class="resultsImageContainer ${groupChatClass}">${chatImage}</div>`;
};

const getUserChatImageElement = (user) => {
  console.log(user);
  if (!user || !user.profilePic) {
    return alert("user passed into function...");
  }
  return `<img src="${user.profilePic}">`;
};
