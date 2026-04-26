const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from frontend directory with index file
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath, { index: 'home.html' }));

// Serve home.html for the root route explicitly
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/home.html'));
});

app.use('/', authRoutes);
app.use('/', transactionRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong.' });
});

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    if (error.code === '28P01') {
      console.error('PostgreSQL login failed. Check username/password in backend/.env DATABASE_URL.');
    } else {
      console.error('Failed to connect to PostgreSQL:', error.message);
    }
    process.exit(1);
  }
};

startServer();
