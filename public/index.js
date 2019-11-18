const Login = require('./login.js');
const Chat = require('./chat.js');
const Game = require('./connect_four.js');
const Utils = require('./public_utils.js');

/* Initialize Board */

gameinfo = new Game.ConnectFourInfo();
document.querySelector('#gameinfo').append(gameinfo.displayHTML);

gameboard = new Game.ConnectFourGame();
document.querySelector('#gameboard').append(gameboard.displayHTML);

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
      console.log('CHAT DATA: ' + JSON.stringify(data));
      Chat.post(data);
    } else if (data.type == 'game') {
      console.log(JSON.stringify(data.body));
      var {board, activeGame, activePlayer, winner, team1, team2} = data.body;
      console.log(JSON.stringify(data.body));
      if (board) 
        gameboard.update(board);
      console.log('Active Player (index.js): ' + activePlayer);
      gameinfo.update(team1, team2, activePlayer, winner);
    }
  }

  console.log('wsocket1: ' + wsocket);
  return wsocket;
}

function send(wsocket, text) {
  const message = {
    type: 'chat',
    text, 
    date: new Date(),
  };
  wsocket.send(JSON.stringify(message));
}

function sendMove(wsocket, position) {
  const message = {
    type: 'game',
    instruction: position,
    date: new Date(),
  };
  wsocket.send(JSON.stringify(message));
}

function sendReset(wsocket) {
  const message = {
    type: 'game',
    instruction: 'RESET',
    date: new Date(),
  };
  wsocket.send(JSON.stringify(message));
}

function sendJoinRequest(wsocket, id) {
  const message = {
    type: 'game',
    newPlayerID: id,
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
      gameboard.moveMarker(gameboard.markerPosition() - 1);
    else if (evnt.keyCode == 76)
      gameboard.moveMarker(gameboard.markerPosition() + 1);
    else if (evnt.keyCode == 13)
      sendMove(wsocket, gameboard.markerPosition());
    else if (evnt.keyCode == 27)
      sendReset(wsocket);
  });

  joinButtonA = document.querySelector('#joinButtonBlack');
  joinButtonA.addEventListener('click', (evnt) => {
    sendJoinRequest(wsocket, 0);
  });

  joinButtonB = document.querySelector('#joinButtonWhite');
  joinButtonB.addEventListener('click', (evnt) => {
    sendJoinRequest(wsocket, 1);
  });
}

const logoutLink = document.querySelector('#logoutlink');
logoutLink.onclick = () => {return Utils.logout();};
Login.authorizeClient(loginSuccess);
