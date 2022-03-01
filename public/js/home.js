$(document).ready(() => {
  $.get("/api/posts", { followingOnly: true }, (results) => {
    console.log(results);
    outputPosts(results, $(".postContainer"));
  });
});
