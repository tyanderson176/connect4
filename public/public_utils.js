function logout () {
  fetch('/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    credentials: 'include',
  })
  .then( response => {
    return response.text();
  })
  .then( text => {
    //Set cookie to expire
    document.cookie += '; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.replace('/index.html');
  });

  return false;
}

Utils = {
  logout,
}

module.exports = Utils;
