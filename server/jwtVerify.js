const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretOrPrivateKey = process.env.SECRET_KEY;

module.exports = function jwtVerifyCase(ws, data) {
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
}