const express = require('express');

const app = express();

const PORT = process.env.port || 3000;

app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('register');
});

app.get('/messaging/', (req, res) => {
  res.render('messaging');
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});