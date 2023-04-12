const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const app = express();

const port = process.env.port || 3000;

app.set('view engine', 'ejs');

const wss = new WebSocket.Server({port: 8080});


app.get('/', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('register');
});

app.get('/messaging', (req, res) => {
    res.render('messaging');
});
wss.on('connection', (ws) => {
  console.log('ws');
  ws.on('message', (msg) => {
    let data = JSON.parse(msg);
    if(data.mobile === '12345678910' && data.password === 'pass123') {
      ws.send('true');
    } else {
      ws.send('false');
    }
  });
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});