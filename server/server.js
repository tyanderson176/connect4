const WebSocket = require('ws'),
      http = require('http'),
      path = require('path'),
      fs = require('fs'),
      browserify = require('browserify');

const Game = require('./game/gameroom.js');
const Utils = require('./utils.js');

const PUBLIC_DIR = path.join(__dirname, '../public/');

const serverUrl = 'localhost';
const port = 3000;

/* setup http and websocket servers */

wsserver = new WebSocket.Server({ noServer: true });

const server = http.createServer((request, response) => {
  logRequest(request);
  const url = sanitize(request.url);
  let policy = url in policies ? policies[url] : policies['default'];
  policy(request, response);
});

console.log('Server @ ' + serverUrl + ': ' + port);
server.listen(port, serverUrl);

/* connecting websocket to server */

server.on('upgrade', (request, wsocket, head) => {
  if (!Utils.authenticate(request)){
    wsocket.destroy();
    return;
  }

  wsserver.handleUpgrade(request, wsocket, head, (ws) => {
    wsserver.emit('connection', ws, request);
  });
});

const gamerooms = { lobby: new Game.Gameroom('Main Lobby'), };
//const lobby = new Gameroom.Lobby('Main Lobby');
wsserver.on('connection', (wsocket, request) => {
  const client = new Game.Client(wsocket, request);
  gamerooms.lobby.add(client);

  wsocket.on('message', (message) => {
    client.handle(JSON.parse(message));
  });
});

/* server helper funcitons */

const logRequest = (request) => {
  console.log('Request from: ' + request.url);
}

const sendFile = (filepath, response) => {
  fs.readFile(filepath, 'binary', (err, file) => {
    if (err)
      throw err;
    if (filepath.split('.').pop() == 'js') {
      const bundled = browserify(filepath).bundle();
      bundled.on('error', console.error);
      bundled.pipe(response);
    } else {
      response.write(file, 'binary');
      response.end();
    }
  });
};

const serveFile = (request, response) => {
  const filepath = path.join(PUBLIC_DIR, sanitize(request.url));
  console.log('Serving file: ' + filepath);
  sendFile(filepath, response);
}

const sanitize = url => {
  //TODO: sanitize to avoid vulnerability
  return url;
}

const authThen = policy => {
  const authorizedPolicy = (request, response) => {
    if (Utils.authenticate(request)) {
      policy(request, response);
    }
    else
      policies['default'](request, response);
  }
  return authorizedPolicy;
}

/* server policies */

let policies = {
  '/index.html': serveFile,
  '/index.js': serveFile,
  '/public_utils.js' : serveFile,

  '/login.js'  : serveFile,
  '/login/auth': Utils.authorizeLogin,
  '/login/authCookie': Utils.authorizeCookie,
  '/logout'    : Utils.logout,

  '/game.js' : serveFile,

  '/blue_circle.jpg' : serveFile,
  '/bQ.svg' : serveFile,

  '/styles/PlayfairDisplay-Regular.ttf': serveFile,
  '/styles/PlayfairDisplay-Bold.ttf'   : serveFile,
  '/styles/Merriweather-Regular.ttf'   : serveFile,
  '/styles/Merriweather-Bold.ttf'      : serveFile,
  '/styles/Modak-Regular.ttf'          : serveFile,
  '/styles/PTMono-Regular.ttf'         : serveFile,
  '/styles/HindMadurai-Light.ttf'      : serveFile,
  '/styles/DidactGothic-Regular.ttf'   : serveFile,
  '/styles/home_styles.css'            : serveFile,
  '/styles/login_styles.css'           : serveFile,

  'default'    : (request, response) => {
    const filename = path.join(PUBLIC_DIR, '/index.html');
    sendFile(filename, response);
  }
};
