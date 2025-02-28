// backend/server.js
const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 5000;

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL user
  password: 'password', // Replace with your MySQL password
  database: 'token_db',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

// API to get tokens from the database
app.get('/tokens', (req, res) => {
  db.query('SELECT * FROM tokens', (err, result) => {
    if (err) {
      res.status(500).send('Error fetching tokens');
    } else {
      res.json(result);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
