class ConnectFourHTMLTable {

  constructor () {
    this.root = document.createElement('div');
    this.numColumns = 7;
    this.numRows = 6;
    
    this.root.append(this.gameInfoElement());
    this.root.append(this.boardElement());
    
    this.markerPosition = 0;
  }

  boardElement() {
    const table = document.createElement('table');
    table.id = 'gametable';

    const markerRow = document.createElement('tr');
    markerRow.id = 'markerrow';
    for(var i=0; i<this.numColumns; ++i) {
      markerRow.append(this.makeTableEntry( (i == 0) ? '*' : '', 'marker'+i));
    }
    table.append(markerRow);

    for(var i=0; i<this.numRows; ++i) {
      const rowElement = document.createElement('tr');
      for(var j=0; j<this.numColumns; ++j) {
        rowElement.append(this.makeTableEntry('_', 'pos(' + i + ',' + j + ')'));
      }
      table.append(rowElement);
    }

    const columnLabels = document.createElement('tr');
    for(var i=0; i<this.numColumns; ++i) {
      columnLabels.append(this.makeTableEntry(i+1, 'label'+i));
    }
    table.append(columnLabels);

    return table;
  }

  makeTableEntry(content, id) {
    const entry = document.createElement('td');
    entry.id = id;
    entry.innerHTML = content;
    return entry;
  }

  gameInfoElement() {
    const infoElement = document.createElement('div');
    infoElement.id = 'gameinfo';
    infoElement.append(this.makeInfoEntry('Current Player: ', 'activeplayer', ''));
    infoElement.append(this.makeInfoEntry('Winner: ', 'winner', 'NONE'));
    return infoElement;
  }

  makeInfoEntry(entryLabel, entryID, entryDefault) {
    const infoEntry = document.createElement('p');
    infoEntry.innerHTML = entryLabel;

    const entryContent = document.createElement('span');
    entryContent.id = entryID;
    entryContent.innerHTML = entryDefault;

    infoEntry.append(entryContent);
    return infoEntry;
  }

  getMarkerPos(pos) {
    return this.markerPosition;
  }

  updateMarkerPos(pos) {
    const markerRow = document.getElementById('markerrow');
    pos = (pos < 0) ? 0 : (pos > this.numColumns-1) ? this.numColumns-1 : pos;
    for(var i=0; i<markerRow.children.length; ++i) {
      markerRow.children[i].innerHTML = (i == pos) ? '*' : '';
    }
    this.markerPosition = pos;
  }

  updateBoardPiece(i, j, sym) {
    const boardPositionElement = document.getElementById('pos('+i+','+j+')');
    boardPositionElement.innerHTML = sym;
  }

  updateActivePlayer(player) {
    const activePlayerElement = document.getElementById('activeplayer');
    activePlayerElement.innerHTML = player;
  }

  updateWinner(player) {
    const winnerElement = document.getElementById('winner');
    winnerElement.innerHTML = player;
  }
}

class ConnectFourGame {
  constructor() {
    this.htmlElement = new ConnectFourHTMLTable();
    this.displayHTML = this.htmlElement.root;
  }

  update (state, activePlayer, winner) {
    this.htmlElement.updateActivePlayer(activePlayer);
    this.htmlElement.updateWinner(winner);
    for (var i=0; i<state.length; ++i) {
      for (var j=0; j<state[i].length; ++j) {
        const sym = state[i][j] == null ? '_' : state[i][j] == 0 ? '@' : 'O';
        this.htmlElement.updateBoardPiece(i, j, sym);
      }
    }
  }

  moveMarker (pos) {
    this.htmlElement.updateMarkerPos(pos);
  }

  markerPosition () {
    return this.htmlElement.getMarkerPos();
  }
}

module.exports = {
  ConnectFourGame,
};
