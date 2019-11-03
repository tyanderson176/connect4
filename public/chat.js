const boundingBox = document.querySelector('#boundingbox');
const commentBox = document.querySelector('#commentbox');
const commentField = document.querySelector('#commentfield');
const commentButton = document.querySelector('#commentbutton');


/* Add comments */

function newHeader(user, time) {
  const header = document.createElement('div');
  header.className = 'comment-header';
  header.innerHTML += '<span class=\'user-tag\'>' + user + '</span> ';
  return header;
}

function newContent(text) {
  const content = document.createElement('div');
  content.className = 'comment-content';
  content.innerHTML += text;
  return content;
}

function newComment(user, text, time) {
  const comment = document.createElement('div');
  comment.className = 'comment';

  comment.append(newHeader(user, time));
  comment.append(newContent(text));
  return comment;
}

function atScrollBottom() {
  const tol = 50;
  const scrollElem = commentBox;
  const maxHeight = scrollElem.scrollHeight - scrollElem.clientHeight;
  return Math.abs(scrollElem.scrollTop - maxHeight) < tol;
}

function scrollToBottom() {
  const scrollElem = commentBox;
  const maxHeight = scrollElem.scrollHeight - scrollElem.clientHeight;
  scrollElem.scrollTop = maxHeight;
}

function post(data) {
  const {username, type, content, time} = data;
  const atBottom = atScrollBottom();
  commentBox.append(newComment(username, content, time));
  if (atBottom)
    scrollToBottom();
}

Chat = {
  atScrollBottom,
  scrollToBottom,
  post,
};

module.exports = Chat;
