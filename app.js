const express = require('express');
const indexRouter = require('./router/index');
const webSocketServer = require('./server/webSocket');

const app = express();

app.use((request, response, next) => {
  indexRouter(request, response, next);
});

webSocketServer();