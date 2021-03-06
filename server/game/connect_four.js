const readline = require('readline-sync');

function makeArray(filler, dims) {
  if (dims.length == 0)
    return filler

  const subArr = makeArray(filler, dims.slice(1))
  const arr = []
  for(var n=0; n<dims[0]; n++)
    arr.push(JSON.parse(JSON.stringify(subArr)));
  return arr
}

class GameInstance {
  constructor() {
    this.numRows = 6, this.numCols = 7;

    this.activeGame = false;
    this.activePlayer = null;
    this.winner = null;
  }

  tryInstruction(instruction, playerID) {
    if (instruction == 'RESET') {
      this.start();
      return true;
    }
    return this.execMove(instruction, playerID);  
  }

  show() {
    console.log('Current Player: player' + (this.activePlayer+1));
    let header_str = ' ';
    for(const n of Array(this.numCols).keys())
      header_str += (n + 1) +  ' ';
    console.log(header_str);

    const sym = { 0: 'O', 1: '@', };
    this.board.forEach( row => {
      const row_str = row.reduce( (acc, cur) => { 
        const tok = cur != null ? sym[cur] : '_';
        return acc + ' ' + tok;
      }, '');
      console.log(row_str);
    });

    console.log(header_str);
  }

  reset() {
    this.board = makeArray(null, [this.numRows, this.numCols]);
    this.activeGame = false;
    this.activePlayer = 0;
    this.winner = null;
  }

  start() {
   /*
    this.board = makeArray(null, [this.numRows, this.numCols]);
    this.activeGame = true;
    this.activePlayer = 0;
    this.winner = null;
   */
    this.reset();
    this.activeGame = true;
  }

  run() {
    this.start();

    this.show();
    while(this.activeGame) {
      const question = '>>Player ' + (this.activePlayer + 1) + ': ';
      const col = parseInt(readline.question(question));
      if (col == NaN) {
        console.log('Please enter a number.');
        continue;
      }
      this.execMove(col-1, this.activePlayer);
      this.show();
    } 
    if (this.winner == null)
      console.log('Draw!');
    else
      console.log('Player ' + (this.activePlayer + 1) + ' wins!');
  }

  execMove(col, playerID) {
    if (col < 0 || col >= this.numCols)
      return false;
    let n = this.numRows-1;
    while(0 <= n && this.board[n][col] != null)
      n--;
    return this.updateTurn(n, col, playerID);
  }

  updateTurn(row, col, playerID) {
    if (this.activePlayer != playerID || (!this.activeGame))
      return false;
    if (!(this.inBounds(row, col)))
      return false;
    this.board[row][col] = playerID;

    if (this.hasWinner()) {
      this.activeGame = false; 
      this.winner = playerID;
    } else if (this.game_tied()){
      this.activeGame = false;
    } else {
      this.activePlayer = (this.activePlayer + 1)%2;
    }
    return true;
  }

  hasWinnerHelper(dirs, state, countConnected, row, col) {
    if (!this.inBounds(row, col) || state[row][col] == null) return false;
    
    countConnected[row][col] = Array(dirs.length).fill(1);
    for(var i=0; i<dirs.length; ++i) {
      const r = row + dirs[i][0], c = col + dirs[i][1];
      if (this.inBounds(r, c) && (state[r][c] == state[row][col])) {
        countConnected[row][col][i] = countConnected[r][c][i] + 1;
        if (countConnected[row][col][i] >= 4)
          return true;
      }
    }
    return false;
  }

  hasWinner() {
    const countConnected = Array(this.numRows).fill(null).map( () => {
      return Array(this.numCols);
    });

    const dirs = [[0, -1], [-1, -1], [-1, 0], [-1, 1]];
    for(var row=0; row<this.numRows; ++row) {
      for(var col=0; col<this.numCols; ++col) {
        if (this.hasWinnerHelper(dirs, this.board, countConnected, row, col))
          return true;
      }
    }
    return false;
  }

/*
  game_won(row, col) {
    let connected = 0;
    const dirs = [[0,1], [1,0], [1,1], [1,-1]];
    dirs.forEach( dir => {
      let r = row, c = col, count = 0;
      while(this.inBounds(r, c) && (this.board[r][c] == this.activePlayer)) {
        count++;
        r += dir[0], c += dir[1];
      }
      r = row - dir[0], c = col - dir[1];
      while(this.inBounds(r, c) && (this.board[r][c] == this.activePlayer)) {
        count++;
        r -= dir[0], c -= dir[1];
      }
      connected = Math.max(connected, count);
    });
    return connected >= 4; 
  }
*/

  game_tied() {
    for(let c=0; c<this.numCols; c++)
      if (this.board[0][c] == null)
        return false;
    return true;
  }

  inBounds(r, c) {
    return (0 <= r && r < this.numRows && 0 <= c && c < this.numCols);
  }
}

//const game = new GameInstance();
//game.run();

module.exports = {
  GameInstance,
}
