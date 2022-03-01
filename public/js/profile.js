$(document).ready(() => {
  if (selectedTab === "replies") {
    loadReplies();
  } else {
    loadPosts();
  }
});

const loadPosts = () => {
  $.get("/api/posts", { postedBy: profileUserId, pinned: true }, (results) => {
    console.log(results);
    outputPinnedPosts(results, $(".pinnedPostContainer"));
  });
  $.get(
    "/api/posts",
    { postedBy: profileUserId, isReply: false },
    (results) => {
      console.log(results);
      outputPosts(results, $(".postContainer"));
    }
  );
};

const loadReplies = () => {
  $.get("/api/posts", { postedBy: profileUserId, isReply: true }, (results) => {
    console.log(results);
    outputPosts(results, $(".postContainer"));
  });
};

const outputPinnedPosts = (results, container) => {
  if (results.length == 0) {
    container.hide();
    return;
  }
  container.html("");
  results.forEach((results) => {
    const html = createPostHtml(results);
    container.append(html);
  });
};
