const WebSocket = require('ws');

const Utils = require('../utils.js');

/*
Meant to encapsulate the type/format of messages

E.g. clients talk in chatrooms via messages, which may be video, may contain
the time, etc.
*/

function makeMessage(name, text, time) {
  const message = {
    username: name,
    text,
    time,
  };
  return message;
}

function broadcastHelper(chatroom, message) {
  Utils.logMessage(chatroom.id, message);
  for(let id in chatroom.clients) {
    const other = chatroom.clients[id];

    //delete websocket from chatroom if not open
    if (!other.open())
      delete chatroom.clients[id];
    else
      other.send(message);
  }
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

class GameInstance {
  constructor(id) {
    this.id = id;
    this.clients = {};
    this.players = {};
    this.game = new ConnectFour.Instance();
    this.game.start();
  }

  broadcast() {
    message = {
      type: 'game',
      board: this.game.board,
      activeGame: this.game.activeGame,
      winner: this.game.winner,
    };
    broadcastHelper(this, message);
  }

  add(client) {
    const numPlayers = Object.keys(this.players).length;
    if (numPlayers > 1)
      return;
    this.players[client.id] = numPlayers;
    this.clients[client.id] = client;
    this.broadcast();
  } 

  move(col, client) {
    const playerID = client.id in this.players ? this.players[client.id] : undefined;
    if (!playerID) return;
    game.execMove(col, playerID);
    this.broadcast();
  }

  remove(client) {
    if (client.id in this.players)
      delete this.players[client.id];
    if (client.id in this.players)
      delete this.clients[client.id];
    this.broadcast();
  }
}

class Lobby {
  constructor(id) {
    this.id = id;
    this.clients = {};
    this.GameInstances = [];
  }

  broadcast(message) {
    message = makeMessage(this.id, message, Date());
    broadcastHelper(this, message);
  }

  add(client) {
    this.clients[client.id] = client;

    const loggedMessages = Utils.loggedMessages(this.id);
    loggedMessages.forEach( message => { client.send(message);});
    this.broadcast(`${Utils.usernameOf(client.id)} entered the chat.`);

    client.broadcast = (message) => {
      message = makeMessage(Utils.usernameOf(client.id), message.text, message.time);
      broadcastHelper(this, message);
    };

    client.handleGame = (message) => {
        if (message.type == 'new_game') {
          const num = this.GameInstances.length + 1;
          const instance = new GameInstance(num);
          this.GameInstances.push(instance);
          instance.add(client);
          return;
        }

        const gameInstance = this.GameInstances[message.gameID];
        if (message.type == 'join') {
          if (gameInstance) gameInstance.add(client);
        }
        else if (message.type == 'move') {
          gameInstance.move(message.col, client);
        }
        else if (message.type == 'leave') {
          gameInstance.remove(client); 
        }
    }

    client.handle = (message) => {
      if (message.type == 'chat')
        client.broadcast(message);
      else
        client.handleGame(message);
    };
  }
}

module.exports = {
  Lobby,
  Client,
};
