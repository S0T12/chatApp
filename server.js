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
            ws.send('false');
          }
        });
        break;
      
      // register request
      case 'register':
        let uuidValue = uuid.v4();
    
        database.query(`SELECT * FROM users WHERE mobile=${data.mobile}`, (err, result) => {
          if(err) throw err;
          
          if(result.length > 0) {
            ws.send('false');
          } else {
            database.query(`INSERT INTO users (mobile, password, uuid) VALUES (${data.mobile}, '${data.password}', '${uuidValue}')`, (err, result) => {
              if(err) throw err;
              
              ws.send('true');
            });
          }
        });
        break;

      // messaging request
      case 'messaging':
        let token = data.token;
        
        jwt.verify(token, secretOrPrivateKey, (err, decoded) => {
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

app.get('/messaging/:uuid', (req, res) => {
  res.render('messaging');
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});