const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'mir',
    password: 'amir002051',
    database: 'chatapp'
});

module.exports = connection;