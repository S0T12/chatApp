const jwt = require('jsonwebtoken');
const database = require('../database');
require('dotenv').config();

const secretOrPrivateKey = process.env.SECRET_KEY;

module.exports = function sendCase(ws, data) {
    jwt.verify(data.token, secretOrPrivateKey, (err, decoded) => {
        if (err) {
          ws.send('invalid token');
          return;
        }
        
        let mobile = decoded.mobile;
        let uuid = decoded.uuid;
        let message = data.message;
        
        database.query(`SELECT contact_mobile FROM contacts WHERE user_mobile =?`, [mobile], (err, results) => {
          if (err) throw err;
        
          let contacts = results.map(function(result) {
            return result.contact_mobile;
          });
          
          contacts.forEach(function(contact) {
            database.query(`INSERT INTO messages (sender, user_mobile, contact_mobile, user_uuid, message) VALUES (?, ?, ?, ?, ?)`, [mobile, mobile, contact, uuid, message], (err, result) => {
              if (err)
                throw err;
              console.log(`done!`);
            });

            database.query(`SELECT sender, message, DATE_FORMAT(created_at, '%b %e, %Y %H:%i:%s') as created_date FROM messages WHERE (user_mobile='${mobile}' AND contact_mobile='${contact}') OR (user_mobile='${contact}' AND contact_mobile='${mobile}')`, (err, results) => {;
              
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
        });
    });
}