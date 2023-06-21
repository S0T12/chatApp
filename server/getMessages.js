const jwt = require('jsonwebtoken');
const database = require('../database');
require('dotenv').config();

const secretOrPrivateKey = process.env.SECRET_KEY;

module.exports = function getMessagesCase(ws, data) {
    jwt.verify(data.token, secretOrPrivateKey, (err, decoded) => {
        if (err) throw err;
        
        let mobile = decoded.mobile;
        let uuid = decoded.uuid;
        let contactNumber = data.contactNumber;
        
        database.query(`SELECT sender, message, DATE_FORMAT(created_at, '%b %e, %Y %H:%i:%s') as created_date FROM messages WHERE (user_mobile=? AND contact_mobile=?) OR (user_mobile=? AND contact_mobile=?)`,[mobile, contactNumber, contactNumber, mobile], (err, results) => {
          if (err) throw err;
          
          let messages = results.map(function(result) {
            return {
              sender: result.sender,
              message: result.message, 
              created_date: result.created_date
            }
          });
          
          ws.send(JSON.stringify({
          type: 'messages',
          messages: messages
          }));
        });
  });
}