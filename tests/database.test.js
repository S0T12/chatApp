const mysql = require('mysql2');
const connection = require('../database');

describe('Connection to Database', () => {
  it('should connect to the database succesfully', async (done) => {
    expect.assertions(2);
    expect(connection.state).toBe('authenticated');
    expect(connection.host).toBe('localhost');
    done();
  });

  it('should fail if credentials are wrong', async (done) => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'arta',
      password: 'pskfsng112',
      database: 'chatapp'
    });
    expect.assertions(1);
    expect(connection.state).toBe('disconnected');
    done();
  });
});
