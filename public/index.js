const StartMenu = require('./start_menu.js');
const Login = require('./login.js');

function loginSuccess() {
  StartMenu.displayStartMenu();
}

Login.authorizeClient(loginSuccess);
