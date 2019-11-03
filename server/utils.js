/*
The database functions currently being used are:
database[username] (gets the password associated with the given username)
database.id2username (gets the set of id/username pairs)
database.id2username[id] (gets the username associated with the id)

The new database should implement these functions somehow

const Database = require('./newdatabase.js');
Database.query('id', username) = id;
Database.query('password', username) = password;

or something like that
*/

const uuidv5 = require('uuidv5'),
      bcrypt = require('bcrypt');

/* database + database functions */

const database = {
  //user1, pass1 is default username, password combo
  'user1': {
    hashedPass: bcrypt.hashSync('pass1', 10),
    name: 'Hambone Fakenamington', 
    email:'ham@fakenaming.ton', 
  },

  'user2': {
    hashedPass: bcrypt.hashSync('pass2', 10),
  },

  //Stores an id, username pair unique to a particular session
  id2username: {
  },
};

function makeUserEntry(username, hashedPass, name, email) {
  database[username] = { hashedPass, name, email, };
}

function usernameOf (id) {
  return database.id2username[id];
}

function logMessage(chatroomID, message) {
  if (!(chatroomID in database))
    database[chatroomID] = []
  database[chatroomID].push(message);
};

function loggedMessages(chatroomID) {
  if (!(chatroomID in database))
    return [];
  return database[chatroomID];
}

/* cookie handling + auxiliary functions */

function parseCookies (request) {
  //Parses cookies from request
  const list = {}, rc = request.headers.cookie;

  rc && rc.split(';').forEach(function( cookie ) {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
}

function setCookieID (username) {
  /*
  Generates a random number cookie for a fresh request
  In the future, could link ID to a persistent profile

  Don't use uuidv5 for CSPRNG (crypto secure pseudo random num gen). It is only designed for unique identifiers for things like cookies. The idea here is to use the username + current time to create the id.
  Kirk 13Sep2019
  */
  var privns = uuidv5('null', username, true);
  const id = uuidv5(privns, String(Date.now()));
  database.id2username[id] = username;
  return 'myid=' + id;
}

function getCookieID (request) {
  const cookies = parseCookies(request);
  return cookies['myid'];
}

function sendCert(response, accepted, cookie) {
  const cert = { accepted, cookie, };
  response.write(JSON.stringify(cert));
  response.end();
}

/* main routines */

function authenticate (request) {
  //Check if request has valid cookie
  const id = getCookieID(request);
  return (id in database.id2username);
}

function authorizeLogin (request, response) {
  //Check request for username/password object
  request.on('readable', () => {
    const info = JSON.parse(request.read());
    //When request stream closes, it sends a null request - do nothing at close
    if (!info) return;

    if (!(info.username in database)) 
      sendCert(response, false, null);
    else {
      const {username, password} = info;
      const client = database[username];
      bcrypt.compare(password, client.hashedPass, (err, match) => {
        if (err) throw err;
        sendCert(response, match, match ? setCookieID(username) : null) 
      });
    }
  });
}

function authorizeCookie (request, response) {
  sendCert(response, authenticate(request), null);
}

function logout (request, response) {
  request.on('readable', () => {
    const cookies = parseCookies(request);
    const id = cookies['myid'];

    if (id in database.id2username)
      delete database.id2username[id];

    response.write('Logout successful');
    response.end();
  });
}

function newUser(request, response) {
  request.on('readable', () => {
    const info = JSON.parse(request.read());
    if(info) {
      const {username, ...personal} = info;
      if(!database[username]){
        //hashCost is a parameter that controls the hash speed
        //higher hashCost => slower hash => more secure
        const hashCost = 10;
        //bcrypt automatically uses a random salt and prepends it to hash
        bcrypt.hash(personal.hashedpass, hashCost, (err, hash) => {
          makeUserEntry(username, hash, personal.name, personal.email);
          sendCert(response, true, setCookieID(username));
        });
      }
      else
        sendCert(response, false, null);
    }
  });
}

Utils = {
  logMessage,
  loggedMessages,
  authenticate,
  setCookieID,
  getCookieID,
  usernameOf,
  authorizeLogin,
  authorizeCookie,
  logout,
  newUser,
}

module.exports = Utils;
