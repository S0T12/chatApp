const request = require('supertest');
const express = require('express');
const app = require('../app');

describe('App', () => {
  let server;

  beforeAll(() => {
    server = express();
    server.use('/', app);
  });

  afterAll(() => {
    server.close();
  });

  test('GET /', async () => {
    const response = await request(server).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'hello, world!' });
  });
});
