const express = require('express');
const { Client } = require('pg');

const app = express();
const port = 3000;

const client = new Client({
  host: 'db',
  user: 'appuser',
  password: 'apppass',
  database: 'appdb',
  port: 5432,
});

client.connect();

app.get('/', async (req, res) => {
  const result = await client.query('SELECT NOW() as time');
  res.send(`Database time: ${result.rows[0].time}`);
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
