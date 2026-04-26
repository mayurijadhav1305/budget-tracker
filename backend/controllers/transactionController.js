const pool = require('../config/db');

const isValidDate = (dateValue) => {
  const parsedDate = new Date(dateValue);
  return !Number.isNaN(parsedDate.getTime());
};

const addTransaction = async (req, res) => {
  try {
    const { amount, type, category, date } = req.body;
    const normalizedType = String(type || '').toLowerCase().trim();
    const normalizedCategory = String(category || '').trim();
    const normalizedDate = String(date || '').trim();
    const numericAmount = Number(amount);

    if (!amount || !type || !category || !date) {
      return res.status(400).json({ message: 'All transaction fields are required.' });
    }

    if (!['income', 'expense'].includes(normalizedType)) {
      return res.status(400).json({ message: 'Type must be income or expense.' });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0.' });
    }

    if (normalizedCategory.length < 2) {
      return res.status(400).json({ message: 'Category must be at least 2 characters.' });
    }

    if (!isValidDate(normalizedDate)) {
      return res.status(400).json({ message: 'Date must be a valid date.' });
    }

    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, type, category, date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, amount, type, category, date`,
      [req.userId, numericAmount, normalizedType, normalizedCategory, normalizedDate]
    );

    return res.status(201).json({
      message: 'Transaction added successfully.',
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, amount, type, category, date
       FROM transactions
       WHERE user_id = $1
       ORDER BY date DESC, id DESC`,
      [req.userId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const getSummary = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
       FROM transactions
       WHERE user_id = $1
         AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)`,
      [req.userId]
    );

    const totalIncome = Number(result.rows[0].total_income);
    const totalExpenses = Number(result.rows[0].total_expenses);
    const remainingBudget = totalIncome - totalExpenses;

    return res.status(200).json({
      totalIncome,
      totalExpenses,
      remainingBudget
    });
  } catch (error) {
    console.error('Get summary error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  getSummary
};
