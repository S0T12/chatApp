const jwt = require('jsonwebtoken');
const database = require('../database');
require('dotenv').config();


const secretOrPrivateKey = process.env.SECRET_KEY;

module.exports = function addContactCase(ws, data) {
    jwt.verify(data.token, secretOrPrivateKey, (err, decoded) => {
        if (err) throw err;
        
        let mobile = decoded.mobile;
        let uuid = decoded.uuid;
        let name = data.name;
        let number = data.number;
        
    database.query(`INSERT INTO contacts (contact_name, contact_mobile, user_mobile, user_uuid) VALUES ('${(name)}', '${number}', '${mobile}', '${uuid}')`, (err, result) => {
      if (err) throw err;
          console.log('add contact done!');
       });

      database.query(`SELECT contact_name, contact_mobile FROM contacts WHERE user_mobile = ${mobile}`, (err, results) => {
        console.log(results);
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