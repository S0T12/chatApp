const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: '',
    password: '',
    database: 'chatapp'
});

module.exports = connection;