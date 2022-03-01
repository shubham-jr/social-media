let typing = false;
let lastTypingTime;

$(document).ready((event) => {
  socket.emit("join room", chatId);
  socket.on("stop typing", () => {
    $(".typingDots").hide();
  });
  socket.on("typing", () => {
    $(".typingDots").show();
  });
  $.get(`/api/chats/${chatId}`, (data) => {
    $("#chatName").text(getChatName(data));
  });

  $.get(`/api/chats/${chatId}/messages`, (data) => {
    const messages = [];
    let lastSenderId = "";
    data.forEach((message, index) => {
      const html = createMessageHtml(message, data[index + 1], lastSenderId);
      messages.push(html);
      lastSenderId = message.sender._id;
    });
    const messagesHtml = messages.join("");
    addMessagesHtmlToPage(messagesHtml);
    scrollToBottom(false);
    $(".loadingSpinnerContainer").remove();
    $(".chatContainer").css("visibility", "visible");
  });
});

$("#chatNameButton").click((event) => {
  const name = $("#chatNameTextbox").val().trim();
  $.ajax({
    url: `/api/chats/${chatId}`,
    type: "put",
    data: { chatName: name },
    success: (data, status, xhr) => {
      if (xhr.status !== 204) alert("could not updated");
      else location.reload();
    },
  });
});

$(".sendMessageButton").click((event) => {
  messageSubmitted();
});

$(".inputTextbox").keydown((event) => {
  updateTyping();
  if (event.which === 13 && !event.shiftKey) {
    messageSubmitted();
    return false;
  }
});
const updateTyping = () => {
  if (connected == false) return;
  if (typing == false) {
    typing = true;
    socket.emit("typing", chatId);
  }
  lastTypingTime = new Date().getTime();
  const timerLength = 3000;
  setTimeout(() => {
    const timeNow = new Date().getTime();
    const timeDiff = timeNow - lastTypingTime;
    if (timeDiff >= timerLength && typing) {
      socket.emit("stop typing", chatId);
      typing = false;
    }
  }, timerLength);
  socket.emit("typing", chatId);
};

const addMessagesHtmlToPage = (html) => {
  $(".chatMessages").append(html);
};

const messageSubmitted = () => {
  const content = $(".inputTextbox").val().trim();
  if (content != "") {
    sendMessage(content);
    $(".inputTextbox").val("");
    socket.emit("stop typing", chatId);
    typing = false;
  }
};

const sendMessage = (content) => {
  $.post("/api/messages", { content, chatId }, (data, status, xhr) => {
    if (xhr.status != 201) {
      alert("could not send message...");
      $(".inputTextbox").val(content);
      return;
    }
    addChatMessageHtml(data);
    if (connected == true) socket.emit("new message", data);
  });
};

const addChatMessageHtml = (message) => {
  if (!message || !message._id) {
    alert("message is not valid...");
    return;
  }
  const messageDiv = createMessageHtml(message, null, "");
  addMessagesHtmlToPage(messageDiv);
  scrollToBottom(true);
};

const createMessageHtml = (message, nextMessage, lastSenderId) => {
  const sender = message.sender;
  const senderName = sender.firstName + " " + sender.lastName;
  const currentSenderId = sender._id;
  const nextSenderId = nextMessage != null ? nextMessage.sender._id : "";
  const isMine = message.sender._id == userLoggedIn._id;
  let liClassName = isMine ? "mine" : "theirs";
  const isFirst = lastSenderId != currentSenderId;
  const islast = nextSenderId != currentSenderId;

  let nameElement = "";

  if (isFirst == true) {
    liClassName += " first";
    if (isMine == false) {
      nameElement = `<span class="senderName">${senderName}</span>`;
    }
  }
  let profileImage = "";
  if (islast == true) {
    liClassName += " last";
    profileImage = `<img src="${sender.profilePic}">`;
  }

  let imageContainer = "";
  if (!isMine) {
    imageContainer = `<div class="imageContainer">
    ${profileImage}
    </div>`;
  }
  console.log(liClassName);
  return `<li class="message ${liClassName}">
  ${imageContainer}
  <div class="messageContainer">
  ${nameElement}
  <span class="messageBody">
  ${message.content}
  </span>
  </div>
  </li>`;
};

const scrollToBottom = (animated) => {
  const container = $(".chatMessages");
  const scrollHeight = container[0].scrollHeight;
  if (animated == true) {
    container.animate({ scrollTop: scrollHeight }, "slow");
  } else {
    container.scrollTop(scrollHeight);
  }
};
