const jwt = require('jsonwebtoken');
const database = require('../database');
require('dotenv').config();

const secretOrPrivateKey = process.env.SECRET_KEY;

module.exports = function getContactsCase(ws, data) {
  jwt.verify(data.token, secretOrPrivateKey, (err, decoded) => {
    if (err) throw err;

    let mobile = decoded.mobile;
    let uuid = decoded.uuid;
      
    database.query(`SELECT contact_name, contact_mobile FROM contacts WHERE user_mobile=? and user_uuid=? `,[mobile,uuid], (err, results) => {
      if (err) {
        console.log(err);
        ws.send(JSON.stringify({
          type: 'contacts',
          contacts: []
        }));
        return;
      }
    
      let contacts = results.map(function(result) {
        return {
          name: result.contact_name,
          number: result.contact_mobile
        }
      });
      
      ws.send(JSON.stringify({
      type: 'contacts',
      contacts: contacts
      }));
    });
  });
}