const jwt = require('jsonwebtoken');
const database = require('../database');
require('dotenv').config();

const secretOrPrivateKey = process.env.SECRET_KEY;

module.exports = function sendCase(ws, data, clients) {
  jwt.verify(data.token, secretOrPrivateKey, (err, decoded) => {
    if (err) {
      ws.send('invalid token');
      return;
    }

    const mobile = decoded.mobile;
    const uuid = decoded.uuid;
    const message = data.message;

    database.query(`SELECT contact_mobile FROM contacts WHERE user_mobile = ?`, [mobile], (err, results) => {
      if (err) throw err;

      const contacts = results.map((result) => result.contact_mobile);

      contacts.forEach((contact) => {
        database.query(
          `INSERT INTO messages (sender, user_mobile, contact_mobile, user_uuid, message) VALUES (?, ?, ?, ?, ?)`,
          [mobile, mobile, contact, uuid, message],
          (err, result) => {
            if (err) throw err;
            console.log('done!');
          }
        );

        database.query(
          `SELECT sender, message, DATE_FORMAT(created_at, '%b %e, %Y %H:%i:%s') as created_date FROM messages WHERE (user_mobile=? AND contact_mobile=?) OR (user_mobile=? AND contact_mobile=?)`,
          [mobile, contact, contact, mobile],
          (err, results) => {
            if (err) throw err;

            const messages = results.map((result) => ({
              sender: result.sender,
              message: result.message,
              created_date: result.created_date,
            }));

            
            clients.forEach((client) => {
              client.ws.send(
                  JSON.stringify({
                    type: 'messages',
                    messages: messages,
                  })
              );
            });
          }
        );
      });
    });
  });
};