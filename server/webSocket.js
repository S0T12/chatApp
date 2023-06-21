const WebSocket = require('ws');
const loginCase = require('./login');
const registerCase = require('./register');
const addContactCase = require('./addContacts');
const getContactsCase = require('./getContacts');
const getMessagesCase = require('./getMessages');
const sendCase = require('./send');
const updateContactNameCase = require('./updateContactName');
const removeContactCase = require('./removeContact');
const jwtVerifyCase = require('./jwtVerify');
const cors = require("cors");

module.exports = function startWebsocketServer () {

  const wss = new WebSocket.Server({ port: 8080, verifyClient: verifyWebsocket });

  function verifyWebsocket(info, done) {
    const origin = info.req.headers.origin;
    const corsOptions = {
      origin: origin,
    }
    const corsOptionsDelegate = (request, callback) => {
      let corsOptions;
      if (request.header('Origin') === origin) {
        corsOptions = { origin: true };
      } else {
        corsOptions = { origin: false };
      }
      callback(null, corsOptions);
    };
    done(corsOptionsDelegate);
  }
  
  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      let data = JSON.parse(msg);
      
      switch (data.action) {
        case 'login':
          loginCase(ws, data);
          break;
        
        case 'register':
          registerCase(ws, data);
          break;

        case 'addContact':
          addContactCase(ws, data);
          break;

        case 'getContacts':
          getContactsCase(ws, data);
          break;
  
        case 'getMessages':
          getMessagesCase(ws, data);
          break;
  
        case 'send':
          sendCase(ws, data);
          break;
          
        case 'updateContactName':
          updateContactNameCase(ws, data);
          break;

        case 'removeContact':
          removeContactCase(ws, data);
          break;
  
        case 'jwtVerify':
          jwtVerifyCase(ws, data);
          break;
      }
    });
  });

  wss.on("error", err => {
    console.error(err);
  });
}
