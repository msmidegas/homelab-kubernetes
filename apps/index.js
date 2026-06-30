const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const port = 3000;

// 🔥 DB CONFIG (bitno: koristi ENV varijable)
const pool = new Pool({
  host: 'db',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,
});

// 🧪 TEST CONNECTION
async function testDB() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ DB connected:', res.rows[0].now);
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
}

// 📦 INIT TABLE
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('📦 users table ready');
}

// ➕ CREATE USER
app.post('/users', async (req, res) => {
  const { name } = req.body;

  const result = await pool.query(
    'INSERT INTO users (name) VALUES ($1) RETURNING *',
    [name]
  );

  res.json(result.rows[0]);
});

// 📥 GET USERS
app.get('/users', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM users ORDER BY id DESC'
  );
  res.json(result.rows);
});
// 🏠 ROOT
app.get("/", (req, res) => {
  res.json({
    service: "homelab-kubernetes",
    status: "running"
  });
});

// ❤️ HEALTH
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message
    });
  }
});
// 🚀 START
async function start() {
  await initDB();
  await testDB();

  app.listen(port, () => {
    console.log(`🚀 App running on port ${port}`);
  });
}

start();
