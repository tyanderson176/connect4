class ConnectFourHTMLTable {
  constructor () {
    this.root = document.createElement('div');
    this.numColumns = 7;
    this.numRows = 6;
    
//    this.root.append(this.gameInfoElement());
    this.root.append(this.boardElement());
    
    this.markerPosition = 0;
    this.sym1 = '@';
    this.sym2 = 'O';
  }

  boardElement() {
    const table = document.createElement('table');
    table.id = 'gametable';

    const markerRow = document.createElement('tr');
    markerRow.id = 'markerrow';
    for(var i=0; i<this.numColumns; ++i) {
      markerRow.append(this.makeTableEntry( (i == 0) ? '*' : '', 'marker'+i, 'odd'));
    }
    table.append(markerRow);

    for(var i=0; i<this.numRows; ++i) {
      const rowElement = document.createElement('tr');
      for(var j=0; j<this.numColumns; ++j) {
        const even = (i + j)%2 == 0 ? 'even' : 'odd';
        rowElement.append(this.makeTableEntry('', 'pos(' + i + ',' + j + ')', even));
      }
      table.append(rowElement);
    }

    const columnLabels = document.createElement('tr');
    for(var i=0; i<this.numColumns; ++i) {
      columnLabels.append(this.makeTableEntry(i+1, 'label'+i, 'odd'));
    }
    table.append(columnLabels);

    return table;
  }

  makeTableEntry(content, id, className) {
    const entry = document.createElement('td');
    entry.className = 'table-entry-' + className;
    entry.id = id;
    entry.innerHTML = content;
    return entry;
  }

  gameInfoElement() {
    const infoElement = document.createElement('div');
    infoElement.id = 'gamedata';
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

  updateBoardPiece(i, j, state) {
    const boardPositionElement = document.getElementById('pos('+i+','+j+')');
//    let sym = (state == null) ?  '' : (state == 0 ? this.sym1 : this.sym2);
    let symClass = 
      (state == null) ? '' : (state == 0 ? 'circle-black' : 'circle-white');
    let sym = ` <span class=${symClass}></span> `; 
    boardPositionElement.innerHTML = sym;
    boardPositionElement.style = (state == 0) ? 'color: black;' : 'color: white;';
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

  update (state) {
    for (var i=0; i<state.length; ++i) {
      for (var j=0; j<state[i].length; ++j) {
        this.htmlElement.updateBoardPiece(i, j, state[i][j]);
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

class ConnectFourInfo {
  constructor() {
    this.displayHTML = document.createElement('div');
    this.labelA = 'Black';
    this.labelB = 'White';

    this.teamElementA = this.makeTeamElement(this.labelA);
    this.teamElementA.style='float: left';
    this.teamElementA.id = 'teamelementA';

    this.teamElementB = this.makeTeamElement(this.labelB);
    this.teamElementB.style='float: right';
    this.teamElementB.id = 'teamelementB';

    this.displayHTML.append(this.teamElementA);
    this.displayHTML.append(this.teamElementB);
    console.log(this.displayHTML.innerHTML);
  }

  update (playerInfoA, playerInfoB, activePlayer, winner) {
    const tableWrapperA = document.querySelector('#' + this.labelA + 'wrapper');
    tableWrapperA.innerHTML = '';
    tableWrapperA.append(this.makeTeamTable(this.labelA, playerInfoA));

    const tableWrapperB = document.querySelector('#' + this.labelB + 'wrapper');
    tableWrapperB.innerHTML = '';
    tableWrapperB.append(this.makeTeamTable(this.labelB, playerInfoB));

    const teamElementA = document.querySelector('#teamelementA');
    const teamElementB = document.querySelector('#teamelementB');
    if (winner != null) {
      (winner == 0 ? teamElementA : teamElementB).className = "team-element-winner";
      const winnerLabel = (winner == 0 ? this.labelA : this.labelB);
      document.querySelector('#teamheader_' + winnerLabel).innerHTML =
        winnerLabel + ' Wins!';
    } else {
      teamElementA.className = 
        activePlayer == 0 ? "team-element-active" : "team-element"; 
      teamElementA.querySelector(".teamheader").innerHTML = this.labelA;

      teamElementB.className = 
        activePlayer == 1 ? "team-element-active" : "team-element"; 
      teamElementB.querySelector(".teamheader").innerHTML = this.labelB;
    }
  }

  makeTeamElement(label) {
    const teamElement = document.createElement('div');
    teamElement.className = 'team-element';

    const tableWrapper = document.createElement('div');
    tableWrapper.append(this.makeTeamTable(label, []));
    tableWrapper.className = 'table-wrapper';
    tableWrapper.id = label + 'wrapper';

    teamElement.append(this.makeTeamHeader(label));
    teamElement.append(tableWrapper);
    teamElement.append(this.makeJoinButton('joinButton' + label));
    return teamElement;
  }

  makeTeamHeader(label) {
    const teamHeader = document.createElement('div'); 
    teamHeader.id = 'teamheader_' + label; 
    teamHeader.className = 'teamheader';
 
    teamHeader.innerHTML = label;
    return teamHeader;
  }

  makeTeamTable(label, playerInfo) {
    const teamTable = document.createElement('table');
    teamTable.className = 'team-table';

/*
    const headerRow = document.createElement('tr');
    headerRow.className = 'header-row';

    const teamLabel = document.createElement('th');
    teamLabel.innerHTML = label;
    teamLabel.className = 'header';
    const voteHeader = document.createElement('th');
    voteHeader.innerHTML = 'vote';
    voteHeader.className = 'header';

    headerRow.append(teamLabel);
    headerRow.append(voteHeader);
    teamTable.append(headerRow);
*/

    playerInfo.forEach( (playerAndVote) => {
      const {player, vote} = playerAndVote;
      teamTable.append(this.makePlayerRow(player, vote));
    });
    return teamTable;
  }

  makePlayerRow(player, vote) {
    const playerRow = document.createElement('tr');
    vote = (vote == null) ? '-' : (vote == 'RESET') ? 'RESET' : parseInt(vote) + 1;
    playerRow.innerHTML = `
      <td style='text-align: left;'> ${player} </td>
      <td style='text-align: left;'> ${vote}   </td>
    `;
    return playerRow;
  }

  makeJoinButton(buttonID) {
    const joinButton = document.createElement('button');
    joinButton.innerHTML = 'Join Team';
    joinButton.className = 'join-button';
    joinButton.id = buttonID;
    return joinButton;
  }
}

module.exports = {
  ConnectFourInfo,
  ConnectFourGame,
};
