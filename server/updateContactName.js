const jwt = require('jsonwebtoken');
const database = require('../database');
require('dotenv').config();

const secretOrPrivateKey = process.env.SECRET_KEY;

module.exports = function updateContactNameCase(ws, data) {
    jwt.verify(data.token, secretOrPrivateKey, (err, decoded) => {
      if (err) throw err;

        const mobile = decoded.mobile;
        const contactMobile = data.contactMobile;
        const newName = data.newName;

        database.query(
          `UPDATE contacts SET contact_name = '${newName}' WHERE user_mobile = '${mobile}' AND contact_mobile = '${contactMobile}'`,
          (err, result) => {
            if (err) throw err;

            if (result.affectedRows > 0) {
              database.query(`SELECT contact_name, contact_mobile FROM contacts WHERE user_mobile='${mobile}'`, (err, results) => {
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
            }
          }
        );
    });
} 