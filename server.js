const express = require('express');
const WebSocket = require('ws');
const database = require('./database');
const app = express();

const port = process.env.port || 3000;

app.set('view engine', 'ejs');

const wss = new WebSocket.Server({port: 8080});
const wss1 = new WebSocket.Server({port: 8081});
// login
wss.on('connection', (ws) => { 
  ws.on('message', (msg) => {
    let data = JSON.parse(msg);
      
    database.query(`SELECT * FROM users WHERE mobile=${data.mobile} AND password='${data.password}'`, (err, result) => {
      if(err) throw err;
      
      if(result.length > 0) {
        ws.send('true');
      } else {
        ws.send('false');
      }
    });
  });
});

// register
wss1.on('connection', (ws) => {
  ws.on('message', (msg) => {
    let data = JSON.parse(msg);
    
    database.query(`SELECT * FROM users WHERE mobile=${data.mobile}`, (err, result) => {
      if(err) throw err;
      
      if(result.length > 0) {
        ws.send('false');
      } else {
        database.query(`INSERT INTO users (mobile, password) VALUES (${data.mobile}, '${data.password}')`, (err, result) => {
          if(err) throw err;
          
          ws.send('true');
        });
      }
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