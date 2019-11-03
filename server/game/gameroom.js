const WebSocket = require('ws');

const Utils = require('../utils.js'),
      ConnectFour = require('./connect_four.js');

/*
Meant to encapsulate the type/format of messages

E.g. clients talk in chatrooms via messages, which may be video, may contain
the time, etc.
*/

function makeMessage(author, type, content, time) {
  const message = {
    username: author,
    type,
    content,
    time,
  };
  return message;
}

function Client(wsocket, request) {
  this.wsocket = wsocket;
  this.id = Utils.getCookieID(request);
  this.send = (message) => {
    wsocket.send(JSON.stringify(message)); 
  };
  this.open = () => {
    return wsocket.readyState == WebSocket.OPEN;
  };
}

class Gameroom {
  constructor(id) {
    this.id = id;
    this.clients = {};
    this.playerIDs = {};

    this.gameInstance = new ConnectFour.GameInstance();
    this.gameInstance.start();
  }

  broadcast(message, cache) {
    if (cache)
      Utils.logMessage(this.id, message);
    for(let id in this.clients) {
      const other = this.clients[id];

      //delete websocket from clients if not open
      if (!other.open())
        delete this.clients[id];
      else
        other.send(message);
    }
  }

  gameState() {
    const state = {
      type: 'game',
      board: this.gameInstance.board,
      activeGame: this.gameInstance.activeGame,
      activePlayer: this.gameInstance.activePlayer,
      winner: this.gameInstance.winner,
    };
    return makeMessage(this.id, 'game', state, Date()); 
  }

  add(client) {
    this.clients[client.id] = client;
    this.playerIDs[client.id] = Object.keys(this.playerIDs).length%2;

    const loggedMessages = Utils.loggedMessages(this.id);
    loggedMessages.forEach( message => { client.send(message);});
    const text = `${Utils.usernameOf(client.id)} entered the chat.`;
    const enterMessage = makeMessage(this.id, 'chat', text, Date());
    this.broadcast(enterMessage, true);
    this.broadcast(this.gameState(), false);

    client.handle = (message) => {
      if (message.type == 'chat' && message.content) {
        const username = Utils.usernameOf(client.id);
        message = makeMessage(username, 'chat', message.content, message.date);
        this.broadcast(message, true);
      } else if (message.type == 'game') {
        if (!(client.id in this.playerIDs)) return;

        const playerID = this.playerIDs[client.id];
        if (this.gameInstance.tryInstruction(
            message.content, this.gameInstance.activePlayer))
          this.broadcast(this.gameState(), false);
      }
    };
  }
}

module.exports = {
  Gameroom,
  Client,
};
