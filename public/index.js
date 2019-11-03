const Login = require('./login.js');
const Chat = require('./chat.js');
const Game = require('./game.js');
const Utils = require('./public_utils.js');

/* Initialize Board */

board = new Game.ConnectFourGame();
document.querySelector('#gameboard').append(board.displayHTML);

/* Websocket */

function connect() {
  let serverUrl = "ws://" + document.location.hostname + ":3000";

  wsocket = new WebSocket(serverUrl, "json");
  wsocket.onopen = (evt) => {
    console.log("Websocket connected.");
  };

  wsocket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.type == 'chat') {
      Chat.post(data);
    } else if (data.type == 'game') {
      board.update(data.content.board, data.content.activePlayer, 
                   data.content.winner);
    }
  }

  console.log('wsocket1: ' + wsocket);
  return wsocket;
}

function send(wsocket, text) {
  const message = {
    type: 'chat',
    content: text,
    date: new Date(),
  };
  wsocket.send(JSON.stringify(message));
}

function sendMove(wsocket, col) {
  const message = {
    type: 'game',
    content: {col,},
    date: new Date(),
  };
  wsocket.send(JSON.stringify(message));
}

function sendReset(wsocket) {
  const message = {
    type: 'game',
    content: {reset: true,},
    date: new Date(),
  };
  wsocket.send(JSON.stringify(message));
}

/* Login and setup websocket */

const commentField = document.querySelector('#commentfield');
var wsocket;
function loginSuccess() {
  wsocket = connect();

  commentField.addEventListener('keyup', (evt) => {
    if (evt.keyCode == 13) {
      send(wsocket, commentField.value);
      commentField.value = '';
    }
  });
  
  document.addEventListener('keyup', (evnt) => {
    if (document.activeElement.tagName == 'INPUT')
      return;
    if (evnt.keyCode == 72)
      board.moveMarker(board.markerPosition() - 1);
    else if (evnt.keyCode == 76)
      board.moveMarker(board.markerPosition() + 1);
    else if (evnt.keyCode == 13)
      sendMove(wsocket, board.markerPosition());
    else if (evnt.keyCode == 27)
      sendReset(wsocket);
  });
}

const logoutLink = document.querySelector('#logoutlink');
logoutLink.onclick = () => {return Utils.logout();};
Login.authorizeClient(loginSuccess);
