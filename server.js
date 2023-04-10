const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const app = express();

const port = process.env.port || 3000;

app.set('view engine', 'ejs');

const wss = new WebSocket.Server({port: 8080});

let mobile;

wss.on('connection', function connection(ws) {
    console.log(`this is ws argument : ${ws}`);
        ws.on('message', function incoming(data) {
        console.log(`this is data argument : ${data}`);
        data = JSON.parse(data);
        mobile = JSON.parse(data.mobile);
        password = JSON.parse(data.password);
        if(data.mobile === '12345678910' && data.password === 'password') {
            ws.send(JSON.stringify({success: true}));
            ws.close();
        } else {
            ws.send(JSON.stringify({
                success: false,
                message: 'Invalid mobile or password.'
            }));
        }
    });
    ws.send(JSON.stringify({
        mobile: mobile.value,
        password: password.value
    }));
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
