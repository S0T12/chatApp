const uuid = require('uuid');
const express = require('express');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const database = require('./database');
const app = express();

const port = process.env.port || 3000;

const secretOrPrivateKey = 'helloWorld';

app.set('view engine', 'ejs');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    let data = JSON.parse(msg);

    switch (data.action) {
      // login request
      case 'login':
        database.query(`SELECT * FROM users WHERE mobile=? and password=?`, [data.mobile, data.password], (err, result) => {
          if (err) throw err;

          if (result.length > 0) {
            const uuid = result[0].uuid;
            let token = jwt.sign({
              mobile: data.mobile,
              uuid: uuid,
              }, secretOrPrivateKey, {
              expiresIn: '7d'
            });
            
            let info = {
              token: token,
              action: "token"
            }
            ws.send(JSON.stringify(info));

          } else {
            console.log(`42 server.js false`);
            let info = {
              res: 'false',
              action: 'falseLogin', 
            }
            ws.send(JSON.stringify(info));
          }
        });
        break;
      
      // register request
      case 'register':
        let uuidValue = uuid.v4();
    
        database.query(`SELECT * FROM users WHERE mobile=${data.mobile}`, (err, result) => {
          if(err) throw err;
          let info;
          if(result.length > 0) {
            info = {
              res: 'false',
              action: 'falseRegister',
            }
            ws.send(JSON.stringify(info));
          } else {
            database.query(`INSERT INTO users (mobile, password, uuid) VALUES (${data.mobile}, '${data.password}', '${uuidValue}')`, (err, result) => {
              if(err) throw err;
              
              info = {
                res: 'true',
                action: 'doneRegister',
              }
              ws.send(JSON.stringify(info));
            });
          }
        });
        break;

      // messaging request
      case 'addContact':        
        jwt.verify(data.token, secretOrPrivateKey, (err, decoded) => {
          if (err) {
            ws.send('invalid token');
            return;
          }
          
          let mobile = decoded.id;
          let uuid = decoded.uuid;
          let name = data.name;
          let number = data.number;
          
          database.query(`INSERT INTO contacts (contact_name, contact_mobile, user_mobile, user_uuid) VALUES ('${name}', '${number}', '${mobile}', '${uuid}')`, (err, result) => {
            if (err) throw err;
            
            ws.send('contact added');
          });
        });
        break;

      // messaging request
      case 'getContacts':
        jwt.verify(data.token, secretOrPrivateKey, (err, decoded) => {
          if (err) {
            ws.send('invalid token');
            return;
          }
          
          let mobile = decoded.mobile;
          let uuid = decoded.uuid;

          
          database.query(`SELECT contact_name, contact_mobile FROM contacts WHERE user_mobile='${mobile}' AND user_uuid='${uuid}'`, (err, results) => {
            if (err) throw err;
          
            let contacts = results.map(function(result) {
              return {
                name: result.contact_name,
                number: result.contact_mobile
              }
            });
            
            ws.send(JSON.stringify({
            type: 'contacts',
            contacts: contacts
            }));
          });
        });
        break;

      // messaging request
      case 'getMessages':        
        jwt.verify(data.token, secretOrPrivateKey, (err, decoded) => {
          if (err) {
            ws.send('invalid token');
            return;
          }
          
          let mobile = decoded.mobile;
          let uuid = decoded.uuid;
          let contactNumber = data.contactNumber;
          
          database.query(`SELECT sender, message FROM messages WHERE user_mobile='${mobile}' AND user_uuid='${uuid}' AND contact_mobile='${contactNumber}'`, (err, results) => {
            if (err) throw err;
            
            let messages = results.map(function(result) {
              return {
                sender: result.sender,
                message: result.message
              }
            });
            
            ws.send(JSON.stringify({
            type: 'messages',
            messages: messages
            }));
          });
        });
        break;

      // messaging request
      case 'send':        
        jwt.verify(data.token, secretOrPrivateKey, (err, decoded) => {
          if (err) {
            ws.send('invalid token');
            return;
          }
          
          let mobile = decoded.id;
          let uuid = decoded.uuid;
          let message = data.message;
          
          database.query(`SELECT contact_mobile FROM contacts WHERE user_mobile='${mobile}' AND user_uuid='${uuid}'`, (err, results) => {
            if (err) throw err;
          
            let contacts = results.map(function(result) {
              return result.contact_mobile;
            });
            
            contacts.forEach(function(contact) {
              database.query(`INSERT INTO messages (sender, contact_mobile, user_mobile, user_uuid, message) VALUES ('${mobile}', '${contact}', '${mobile}', '${uuid}', '${message}')`, (err, result) => {
                if (err) throw err;
              });
            });
          
            ws.send('message sent');
          });
        });
        break;


      // jwt verification request
      case 'jwtVerify':
        let result;
        try {
          result = jwt.verify(data.token, secretOrPrivateKey);
        } catch(err) {
          console.log(err);

          let data = {
            result: "false",
            action: "jwt"
          }
          ws.send(JSON.stringify(data));
          return;
        }

        if (result) {
          let data = {
            result: "true",
            action: "jwt"
          }
          ws.send(JSON.stringify(data));
        } else {
          let data = {
            result: "false",
            action: "jwt"
          }
          ws.send(JSON.stringify(data));
        }
        break;
    }
  });
});

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('register');
});

app.get('/messaging/', (req, res) => {
  res.render('messaging');
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});