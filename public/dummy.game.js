function displayActiveGame () {
  gameBoard = document.createElement('div');
  gameBoard.className = 'dummy-window';
  gameBoard.innerHTML = 'This is the game';

  document.body.append(gameBoard);
}

module.exports = {
  displayActiveGame,
}
