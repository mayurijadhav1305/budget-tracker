const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Pool manages PostgreSQL connections for your app.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = pool;
