const uuid = require('uuid');
const express = require('express');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const database = require('./database');
const app = express();

const port = process.env.port || 3000;

const secretOrPrivateKey = 'helloWorld';

app.set('view engine', 'ejs');

const wss = new WebSocket.Server({port: 8080});
const wss1 = new WebSocket.Server({port: 8081});
const wss2 = new WebSocket.Server({port: 8082});
const wss3 = new WebSocket.Server({port: 8083});

// login
wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    let data = JSON.parse(msg);

    console.log(`give data from client in server : ${data.mobile}`);
    
    database.query(`SELECT * FROM users WHERE mobile=?`, [data.mobile], (err, result) => {
      if (err) throw err;

      console.log(`this is result.length : ${result.length}`);
      if (result.length > 0) {
        const uuid = result[0].uuid;
        let token = jwt.sign({
          mobile: data.mobile,
          uuid: uuid
        }, secretOrPrivateKey, {
          expiresIn: '7d'
        });
        console.log(`send token from server : ${token}`);
        ws.send(token);

      } else {
        ws.send('false');
      }
    });
  });
});

// JWT verification
wss3.on('connection', (ws) => {
    ws.on('message', (msg) => {
      let data = JSON.parse(msg);
      console.log('this msg for JWT verification : ' + data);
      let result;
      try {
        result = jwt.verify(data, secretOrPrivateKey);
      } catch(err) {
        console.log(err);
        ws.send('false');
        console.log(`data is not create in server for JWT verification`);
        return;
      }
      if (result) {
        console.log(`data have value`);
        ws.send('true');
      } else {
        console.log(`data not have value`);
        ws.send('false');
      }
    });
});


// register
wss1.on('connection', (ws) => {
  ws.on('message', (msg) => {
    let data = JSON.parse(msg);
    console.log('hello world');
    
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
  });
});

// Add contact
wss2.on('connection', (ws) => {
  ws.on('message', (msg) => {
    let data = JSON.parse(msg);
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
  });
});

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('register');
});

app.get('/messaging', (req, res) => {
    res.render('messaging');
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});