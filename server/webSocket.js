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

module.exports = function startWebsocketServer() {
  const wss = new WebSocket.Server({ port: 8080 });

  const clients = new Map();

  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      let data = JSON.parse(msg);

      const contactNumber = data.contactNumber;
      const clientId = generateClientId();
      console.log(`clientId : ${clientId}`);
      clients.set(clientId, {ws: ws, contactNumber: contactNumber});    

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
          sendCase(ws, data, clients);
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

  wss.on('error', (err) => {
    console.error(err);
  });
};

function generateClientId() {
  return Math.random().toString(36).substr(2, 9);
}
