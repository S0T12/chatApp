const express = require('express');
const indexRouter = require('./router/index');
const webSocketServer = require('./server/webSocket');
const helmet = require("helmet");
const rateLimiter = require("express-rate-limit");
const cors = require("cors");
require('dotenv').config();

const app = express();

app.use(helmet());

const limiter = rateLimiter({
  windowMs: 5 * 60 * 1000, 
  max: 500, 
  message: "Too many request has been made, please try again later",
});


app.use(cors());
app.use(limiter);
app.use((request, response, next) => {
  indexRouter(request, response, next);
});

webSocketServer();
