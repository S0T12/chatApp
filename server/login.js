const jwt = require('jsonwebtoken');
const database = require('../database');
const bcrypt = require('bcrypt'); 
require('dotenv').config();

const secretOrPrivateKey = process.env.SECRET_KEY;

module.exports = async function loginCase(ws, data) {
    
    let mobile = data.mobile;
    let password = data.password;
    
    try {
        database.query(`SELECT * FROM users WHERE mobile=?`,[mobile], async (err, results) => { // Parameters passed should be sanitized 
            if(err) throw err;

            if (results && results.length>0) {

                const match = await bcrypt.compare(password, results[0].password);

                if (match) {    
                    let token = jwt.sign({
                        mobile: mobile,
                        uuid: results[0].uuid,
                        }, secretOrPrivateKey, {
                        expiresIn: '7d'
                    });
                
                    let info = {
                        token: token,
                        action: "token"
                    }
                    ws.send(JSON.stringify(info));
                } else {
                    let info = {
                        res: 'false',
                        action: 'falseLogin', 
                    }
                    ws.send(JSON.stringify(info));
                }
            } else {
                let info = {
                    res: 'false',
                    action: 'falseLogin', 
                }
                ws.send(JSON.stringify(info));
            }
    
        });
    } catch (err) {
        console.log(err);
        let data = {
            res: 'false',
            action: 'falseLogin',
            message: err
        }
        ws.send(JSON.stringify(data)); 
    } 
}