const jwt = require('jsonwebtoken');
const database = require('../database');


const secretOrPrivateKey = process.env.SECRET_KEY;

module.exports = function removeContactCase(ws, data) {
    jwt.verify(data.token, secretOrPrivateKey, (err, decoded) => {
        if (err) throw err;

        let mobile = decoded.mobile;
        let contactMobile = data.contactNumber;
        
        database.query(`DELETE FROM contacts WHERE user_mobile=? AND contact_mobile=?`, 
        [mobile,contactMobile], (err, result) => {
            if (err) throw err;

            if (result.affectedRows > 0) {
              database.query(`SELECT contact_name, contact_mobile FROM contacts WHERE user_mobile='${mobile}'`, (err, results) => {
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