class Conn4Minimax {
  constructor(maxDepth) {
    this.maxDepth = maxDepth;
    this.numRows = 6;
    this.numColumns = 7;
    this.dirs = [[0, -1], [-1, -1], [-1, 0], [-1, 1]];
  }

  validPosition(row, col) {
    return (0 <= row && row < this.numRows && 0 <= col && col < this.numColumns);
  }

  evalFunc(count, token) {
    const winUtility = 1e3;
    var evalResult;
    if (count > 3)
      evalResult = token == '1' ? winUtility : -winUtility;
    else
      evalResult = token == '1' ? Math.pow(2, count) : -Math.pow(2, count);
    return evalResult;
  }

  evalHelper(state, countConnected, row, col) {
    if (!this.validPosition(row, col) || state[row][col] == null) return 0;

    var utility = 0;
    countConnected[row][col] = Array(this.dirs.length).fill(1);
    for(var i=0; i<this.dirs.length; ++i) {
      const r = row + this.dirs[i][0], c = col + this.dirs[i][1];
      if (this.validPosition(r, c) && state[r][c] == state[row][col]) {
        countConnected[row][col][i] = countConnected[r][c][i] + 1;
        
        const r2 = row - this.dirs[i][0], c2 = col - this.dirs[i][1];
        if (!this.validPosition(r2, c2) || state[r2][c2] != state[row][col]) {
          const token = state[row][col];
          utility += this.evalFunc(countConnected[row][col][i], token);
        }
      }
    }

    return utility;
  }

  eval(state) {
    var utility = 0;
    const countConnected = Array(this.numRows).fill(null).map( () => {
      return Array(this.numColumns);
    });


    for(var row=0; row<this.numRows; ++row) {
      for(var col=0; col<this.numColumns; ++col) {
        utility += this.evalHelper(state, countConnected, row, col);
      }
    }
    
    return utility;
  } 

  finishedHelper(state, countConnected, row, col) {
    if (!this.validPosition(row, col) || state[row][col] == null) return false;
    
    countConnected[row][col] = Array(this.dirs.length).fill(1);
    for(var i=0; i<this.dirs.length; ++i) {
      const r = row + this.dirs[i][0], c = col + this.dirs[i][1];
      if (this.validPosition(r, c) && (state[r][c] == state[row][col])) {
        countConnected[row][col][i] = countConnected[r][c][i] + 1;
        if (countConnected[row][col][i] >= 4)
          return true;
      }
    }
    return false;
  }

  finished(state) {
    const countConnected = Array(this.numRows).fill(null).map( () => {
      return Array(this.numColumns);
    });

    for(var row=0; row<this.numRows; ++row) {
      for(var col=0; col<this.numColumns; ++col) {
        if (this.finishedHelper(state, countConnected, row, col))
          return true;
      }
    }

    return false;
  }

  actions(state) {
    const actionsArray = [];
    for (var i = 0; i < this.numColumns; ++i)
      actionsArray.push(i);
    return actionsArray;
  }

  apply(action, state, playerID) {
    var i = 0;
    for(; i < this.numRows; ++i)
      if (state[i][action] == null)
        break;
    if (i == this.numRows) return false;

    state[i][action] = (playerID == 0) ? '0' : '1';
    return true;
  } 

  invert(action, state, playerID) {
    var i = 0;
    for(; i < this.numRows; ++i)
      if (state[i][action] == null)
        break;
    state[i-1][action] = null;
  }

  updateMinimax(minimaxUtility, trialUtility, playerID) {
    if (playerID == 1)
      return minimaxUtility < trialUtility;
    else
      return minimaxUtility > trialUtility;
  }

  solveHelper(state, playerID, depth) {
    if (depth >= this.maxDepth || this.finished(state)) {
      return [this.eval(state), -1];
    }
    
    var minimaxUtility = (playerID == 0) ? Number.POSITIVE_INFINITY : 
                                           Number.NEGATIVE_INFINITY;
    var minimaxAction = -1;
    for (var action in this.actions(state)) {
      if (!(this.apply(action, state, playerID))) continue;
      const [trialUtility, trialAction] = this.solveHelper(
          state, (playerID+1)%2, depth+1);
      this.invert(action, state, playerID);

      if (depth == 0) {
        console.log('Action: ' + action);
        console.log('Utility: ' + trialUtility);
      }

      if (this.updateMinimax(minimaxUtility, trialUtility, playerID)
          || minimaxAction == -1) {
        minimaxUtility = trialUtility;
        minimaxAction = action;
      }
    }

    return [minimaxUtility, minimaxAction];
  }

  solve(state, playerID) {
    const [minimaxUtility, minimaxAction] = this.solveHelper(state, playerID, 0);
    return minimaxAction;
  }
}

/*
const ai = new Conn4Minimax(6);

state = [
  [ '0',  '0',  '0',  '1', null, null, null],
  [ '1',  '0', null,  '1', null, null, null],
  [ '0',  '1', null,  '1', null, null, null],
  [ '1', null, null,  '0', null, null, null],
  [null, null, null,  '1', null, null, null],
  [null, null, null, null, null, null, null],
]

console.log(state);
console.log(ai.solve(state, 0));
*/

module.exports = {
  Conn4Minimax,
}
