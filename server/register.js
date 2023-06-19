const bcrypt = require('bcrypt'); 
const database = require('../database');
const uuid = require('uuid');
require('dotenv').config();

const SALT_ROUNDS = 10; 

module.exports = async function registerCase(ws, data) {


    let uuidValue = uuid.v4();
        
    let mobile = data.mobile;
    let password = data.password;
        
    try {
        database.query(`SELECT * FROM users WHERE mobile=${mobile}`, async (err, results) => {
            if(results.length > 0) {
                let info = {
                res: 'false',
                action: 'falseRegister',
                }
                ws.send(JSON.stringify(info));
            } else {
                let hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
                database.query(`INSERT INTO users (mobile, password, uuid) VALUES (${mobile}, '${hashedPassword}', '${uuidValue}')`);
                
                let info = {
                    res: 'true',
                    action: 'doneRegister',
                }
                ws.send(JSON.stringify(info));
            }
        });
    } catch (err) {
        console.log(err);
    }   
}
