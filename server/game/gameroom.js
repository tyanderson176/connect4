const WebSocket = require('ws');

const Utils = require('../utils.js'),
      ConnectFour = require('./connect_four.js'),
      AI = require('./minimax.js');

/*
Meant to encapsulate the type/format of messages

E.g. clients talk in chatrooms via messages, which may be video, may contain
the time, etc.
*/

function makeMessage(author, type, content, time) {
  const message = {
    username: author,
    type,
    body: content,
    time,
  };
  return message;
}

function BotClient() {
  this.id = 'bot';
  this.playerID = null;
  this.vote = null;

  this.maxDepth = 7;
  this.solver = new AI.Conn4Minimax(this.maxDepth);
  this.solve = (board) => {
    return this.solver.solve(board, this.playerID);
  }
  
  this.send = (message) => {
    return;
  };
  
  this.open = () => {
    return true;
  };
}

function Client(wsocket, request) {
  this.wsocket = wsocket;
  this.id = Utils.getCookieID(request);
  this.playerID = null;
  this.vote = null;
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

    this.bot = new BotClient();
    this.clients[this.bot.id] = this.bot;

    this.gameInstance = new ConnectFour.GameInstance();
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

  getTeams() {
    const team1Players = [], team2Players = [];
    Object.entries(this.clients).forEach( (clientInfo) => {
        let [id, client] = clientInfo;
        const username = Utils.usernameOf(id) ? Utils.usernameOf(id) : 'Bot';
        if (client.playerID != null) {
            const clientTeam = (client.playerID == 0) ? team1Players : team2Players;
            clientTeam.push({player : username, vote: client.vote});
        }
    });
    return [team1Players, team2Players]; 
  }

  gameState(sender, updateBoard) {
    const [team1Players, team2Players] = this.getTeams();
    
    const state = {
      type: 'game',
      activeGame: this.gameInstance.activeGame,
      activePlayer: this.gameInstance.activePlayer,
      winner: this.gameInstance.winner,
      team1: team1Players,
      team2: team2Players,
    };
    if (updateBoard) state.board = this.gameInstance.board;

    return makeMessage(this.id, 'game', state, Date()); 
  }

  mostFreqInstruc() {
    const activePlayer = this.gameInstance.activePlayer;
    const count = {};
    Object.values(this.clients).forEach( (client) => {
      if (client.playerID == activePlayer) {
        if (!(client.vote in count))
          count[client.vote] = 0;
        count[client.vote]++; 
      }
    });

    var mostFrequent = 0, maxFreq = 0;
    Object.entries(count).forEach( (pair) => {
      const [sug, freq] = pair;
      if (freq > maxFreq) {
        mostFrequent = sug;
        maxFreq = freq;
      }
    });
    return mostFrequent;
  }

  teamsSelected() {
    var team1Empty = true, team2Empty = true, nullPlayer = false;
    Object.values(this.clients).forEach( (client) => {
      if (client.playerID == null && client.id != this.bot.id)
        nullPlayer = true;
      if (client.playerID == 0)
        team1Empty = false;
      if (client.playerID == 1)
        team2Empty = false;
    });
    return !team1Empty && !team2Empty && !nullPlayer;
  }

  resetTeams() {
    //TODO: Start clock?
    Object.values(this.clients).forEach( (client) => {
      client.playerID = null;
      client.vote = null;
    });
  }

  resetGame() {
    this.resetTeams();
    this.gameInstance.reset();
  }

  turnFinished() {
    const activePlayer = this.gameInstance.activePlayer;
    for(var id in this.clients) {
      const client = this.clients[id];
      if (client.playerID == activePlayer && client.vote == null) {
        return false;
      }
    }
    return true;
  }

  finishTurn() {
    const activePlayer = this.gameInstance.activePlayer;
    const instruction = this.mostFreqInstruc();
    if (this.gameInstance.tryInstruction(instruction, activePlayer)) {
      Object.values(this.clients).forEach( (client) => {
        client.vote = null;
      });
      console.log('Finished Turn');
      this.broadcast(this.gameState('sender', true), false);

      if (this.gameInstance.activePlayer == this.bot.playerID) {
        const board = this.gameInstance.board.slice().reverse();
        this.bot.vote = this.bot.solve(board);
        if (this.turnFinished() && this.gameInstance.activeGame)
          this.finishTurn();
      }
    }
  }

  add(client) {
    this.clients[client.id] = client;

    const loggedMessages = Utils.loggedMessages(this.id);
    loggedMessages.forEach( message => { client.send(message);});
    const text = `${Utils.usernameOf(client.id)} entered the lobby.`;
    const enterMessage = makeMessage(this.id, 'chat', text, Date());
    this.broadcast(enterMessage, true);
    client.send(this.gameState(client.id, true));

    client.handle = (message) => {
      console.log('Message received: ');
      console.log(JSON.stringify(message));

      if (message.type == 'chat') {
        if (!message.text) return;
        const username = Utils.usernameOf(client.id);
        message = makeMessage(username, 'chat', message.text, message.date);
        this.broadcast(message, true);
      } 

      if (message.type == 'game') {
        if (!this.gameInstance.activeGame) { 
          if (message.newPlayerID == null) return;
          client.playerID = message.newPlayerID;
          const [team1, team2] = this.getTeams();
          this.bot.playerID = 
            (team1.length == 0) ? 0 : (team2.length == 0) ? 1 : null;
          if (this.teamsSelected()) { 
            this.gameInstance.start();
            if (this.gameInstance.activePlayer == this.bot.playerID) {
              const board = this.gameInstance.board.slice().reverse();
              this.bot.vote = this.bot.solve(board);
            }
            if (this.turnFinished()) this.finishTurn();
          }
          this.broadcast(this.gameState(this.id, true), false);
        }
        else if (this.gameInstance.activeGame) {
          if (!this.teamsSelected()) { 
            this.resetGame();
            return;
          }
          if (message.instruction == null) return;
          if (client.playerID == this.gameInstance.activePlayer) { 
                client.vote = message.instruction;
          }
          if (this.turnFinished()) this.finishTurn();
          this.broadcast(this.gameState(client.id, false), false);
          if (!this.gameInstance.activeGame) {
             this.resetTeams();
             console.log('***\nRESET TEAMS\n***')
          }
        }
      }
    };
  }
}

module.exports = {
  Gameroom,
  Client,
};
