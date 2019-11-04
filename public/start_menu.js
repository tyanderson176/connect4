const Game = require('./dummy.game.js');

function displayStartMenu() {
  menu = document.createElement('div');
  menu.className = 'start-menu';
  menu.id = 'startmenu';
  menu.className = 'dummy-window';
  menu.innerHTML += `
    <div id='activegames'>
      <p> Ongoing Games: </p>    
    </div>
    <input type='button' class='button' id='newgame' value='New Game'>
  `;

  document.body.append(menu);
  loadActiveGames();

  const newGameButton = document.querySelector('#newgame');
  newGameButton.addEventListener('click', (evnt) => {
    menu.parentNode.removeChild(menu);
    Game.displayActiveGame();
  });
}

function displayGameSummary(player1, player2, gameID) {
  const startMenu = document.querySelector('#startmenu');

  const joinButton = document.createElement('input');
  joinButton.type = 'button';
  joinButton.className = 'button';
  joinButton.id = 'gamebutton' + gameID;
  joinButton.value = (player1 != null && player2 != null) ? 'Watch' : 'Join';

  const gameSummary = document.createElement('p');
  gameSummary.append(joinButton);
  gameSummary.append(player1 + ' v. ' + player2);

  startMenu.append(gameSummary);

  joinButton.addEventListener('click', (evnt) => {
    const menu = document.querySelector('#startmenu');
    menu.parentNode.removeChild(menu);
    Game.displayActiveGame(gameID);
  });
}

function loadActiveGames() {
  fetch('/startMenu/sendActiveGames', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  .then( response => {
    return response.json();
  })
  .then( activeGames => {
    const gamesIDs = Object.keys(activeGames);
    gamesIDs.forEach( (id) => {
      const {player1, player2} = activeGames[id];
      displayGameSummary(player1, player2, id);
    });
  });
}

module.exports = {
  displayStartMenu,
}
