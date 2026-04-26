const express = require('express');
const {
  addTransaction,
  getTransactions,
  getSummary
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/transactions', authMiddleware, addTransaction);
router.get('/transactions', authMiddleware, getTransactions);
router.get('/summary', authMiddleware, getSummary);

module.exports = router;
