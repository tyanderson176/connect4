I've tried to structure the project in a simple and extentable way.

Code is broken into server-side and client-side code. Client-side
code is executed on the client's browser; server-side code is
executed on a server that we will have to buy.

Project Structure:

web/
  server/
    server.js
    chat.js
    utils.js
  public/
    styles/
      *tff
      *css
    login.html
    login.js
    index.html
    index.js

I'll briefly explain the overall code structure.

The public section is simple. Each unique web page has it's own .html
file and it's own .js file. For example, the login screen's overall
structure is given in login.html, and all the dynamic operations are
given in login.js.

The server section is more complicated. You can image the dependency
graph as follows:

            utils.js
  /            |            \ 
chat.js  futurefile1.js  futurefile2.js
   \           |            /
            server.js


Each file depends on the files that come above it.

This means that chat.js/futurefile.js/futurefile2.js all depend on
utils.js; server.js depends on chat.js, futurefile.js, futurefile2.js,
and utils.js.

The idea is that utils.js contains universal functions that are necessary
to orchestrate behavior between independent subprograms.

The second row contains files, each independent of each other, which
implement some specific functionality (chat.js, for example, implements
the client object/chatrooms).

The third row only contains server.js. Server.js is the main logical
`nexus` where the rest of the program logic comes together.

Its best to just look at the code to see exactly what it does.

TODO:
*Database*
Right now, utils.js implements the database as a json object in RAM.
A new file should be made which implements a better strategy but 
uses the same interface already used in utils.js.

*Security*
utils.js also implements the security procedure, which is as follows.
~~username/password are stored in the database as plain text~~. At login,
the client's username/password entered into the login page is sent to
the server. If the username/password matches the database, a random id 
is made for that particular user. This random id is sent as a cookie
to the user's browser.

When `protected` requests to the server are made, the server checks if
the id is in the database. If so, the request is fulfilled. Otherwise,
the user is sent to the login screen.

*Style*
I'm not great at styling things, but I want it to look good. Feel free
to suggest design changes/font suggestions, etc.

*Functionality*
In terms of general functionality, there is a ton to do. ~~Logging out~~,
multiple chatrooms, chatroom creation, switching between chatrooms,
payment methods (???), video chat (???), are just the start.
