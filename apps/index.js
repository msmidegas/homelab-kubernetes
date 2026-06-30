const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const port = 3000;

/**
 * 🔥 DB CONNECTION POOL (PRODUCTION STYLE)
 */
const pool = new Pool({
  host: 'db',
  user: 'appuser',
  password: 'apppass',
  database: 'appdb',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
});

/**
 * 🧪 TEST CONNECTION ON START
 */
async function testDB() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ DB connected:', res.rows[0].now);
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }
}

/**
 * 🚀 HEALTH ENDPOINT
 */
app.get('/health', async (req, res) => {
  try {
    const db = await pool.query('SELECT 1 as ok');
    res.json({
      status: 'ok',
      db: db.rows[0].ok,
      time: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err.message,
    });
  }
});

/**
 * 👤 CREATE USERS TABLE (AUTO INIT)
 */
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

/**
 * ➕ CREATE USER
 */
app.post('/users', async (req, res) => {
  const { name } = req.body;

  const result = await pool.query(
    'INSERT INTO users (name) VALUES ($1) RETURNING *',
    [name]
  );

  res.json(result.rows[0]);
});

/**
 * 📥 GET USERS
 */
app.get('/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users ORDER BY id DESC');
  res.json(result.rows);
});

/**
 * 🚀 START SERVER (SAFE BOOTSTRAP)
 */
async function start() {
  await initDB();
  await testDB();

  app.listen(port, () => {
    console.log(`🚀 App running on port ${port}`);
  });
}

start();
