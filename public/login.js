function authorizeClient(success) {
  fetch('/login/authCookie', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  .then( response => {
    return response.json();
  })
  .then( cert => {
    if (!cert.accepted)
      promptLogin(success)
    else
      success();
  });
}

function sendCredentials(elem, success) {
  //send credentials in elem DOM object
  const username = elem.querySelector('#username').value;
  const password = elem.querySelector('#password').value;
  const loginMessage = elem.querySelector('#loginmessage');
  const creds = { username, password };

  fetch('/login/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(creds),
  })
  .then( response => {
    return response.json();
  })
  .then( cert => {
    if (cert.accepted == false) {
      loginMessage.innerText = 'username/password could not be authenticated';
    } else {
      elem.parentNode.removeChild(elem);
      document.cookie = cert.cookie;
      success();
    }
  });
}

function cleanupThen(elem, proc) {
  console.log('cleanup?');
  elem.parentNode.removeChild(elem);
  proc();
}

function promptLogin(success) {
  const loginWindow = document.createElement('div');  
  loginWindow.className = 'login-window';
  loginWindow.innerHTML += `
    <h3 class='login-header'> Login </h3>
    <input type='text' class='input' id='username' placeholder='username'>
    <br>
    <input type='password' class='input' id='password' placeholder='password'>
    <br>
    <p class='login-failure' id='loginmessage'></p>
    <!--<input type='button' class='button' id='enter' value='Enter'>
    <input type='button' class='button' id='newuser' value='New User?'>
    -->
  `;
  loginWindow.sendCredentials = sendCredentials;

  loginWindow.querySelector('#username').addEventListener('keyup', (evnt) => {
    if (evnt.keyCode == 13) 
      sendCredentials(loginWindow, success);
  });
  loginWindow.querySelector('#password').addEventListener('keyup', (evnt) => {
    if (evnt.keyCode == 13) 
      sendCredentials(loginWindow, success);
  });

  document.body.append(loginWindow);
}

Login = {
  promptLogin,
  authorizeClient,
}

module.exports = Login;
