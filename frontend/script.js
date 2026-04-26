const API_BASE_URL = 'http://localhost:5000';
const FRONTEND_BASE = '/frontend';
const pagePath = (name) => `${FRONTEND_BASE}/${name}`;

const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const goLoginBtn = document.getElementById('goLoginBtn');
const goSignupBtn = document.getElementById('goSignupBtn');
const openBudgetBtn = document.getElementById('openBudgetBtn');
const logoutBtn = document.getElementById('logoutBtn');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const speakExpenseBtn = document.getElementById('speakExpenseBtn');
const speakAmountBtn = document.getElementById('speakAmountBtn');
const setIncomeBtn = document.getElementById('setIncomeBtn');
const calculateBtn = document.getElementById('calculateBtn');
const quickButtons = document.querySelectorAll('[data-quick]');

let myChart = null;
let allTransactions = [];

const getToken = () => localStorage.getItem('token');

const setMessage = (elementId, text, isError = false) => {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? '#fecaca' : '#bbf7d0';
};

const showNotification = (text) => {
  const box = document.getElementById('notification');
  if (!box) return;
  box.textContent = text;
  box.classList.add('show');
  setTimeout(() => box.classList.remove('show'), 2000);
};

const getToday = () => new Date().toISOString().split('T')[0];

const apiFetch = async (path, options = {}, needsAuth = false) => {
  const headers = { ...(options.headers || {}) };
  if (needsAuth) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }
  return data;
};

if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      setMessage('signupMessage', 'Email and password are required.', true);
      return;
    }

    try {
      await apiFetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      setMessage('signupMessage', 'Signup successful! Redirecting...');
      setTimeout(() => { window.location.href = pagePath('login.html'); }, 900);
    } catch (error) {
      setMessage('signupMessage', error.message, true);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      setMessage('loginMessage', 'Email and password are required.', true);
      return;
    }

    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem('token', data.token);
      setMessage('loginMessage', 'Login successful! Redirecting...');
      setTimeout(() => { window.location.href = pagePath('budget.html'); }, 700);
    } catch (error) {
      setMessage('loginMessage', error.message, true);
    }
  });
}

if (goLoginBtn) {
  goLoginBtn.addEventListener('click', () => {
    window.location.href = pagePath('login.html');
  });
}

if (goSignupBtn) {
  goSignupBtn.addEventListener('click', () => {
    window.location.href = pagePath('signup.html');
  });
}

if (openBudgetBtn) {
  openBudgetBtn.addEventListener('click', () => {
    if (getToken()) {
      window.location.href = pagePath('budget.html');
    } else {
      window.location.href = pagePath('login.html');
    }
  });
}

const renderExpenseList = () => {
  const list = document.getElementById('list');
  if (!list) return;
  list.innerHTML = '';

  allTransactions
    .filter((t) => t.type === 'expense')
    .forEach((expense) => {
      const li = document.createElement('li');
      li.textContent = `${expense.category} : ₹${Number(expense.amount).toFixed(2)} (${new Date(expense.date).toLocaleDateString()})`;
      list.appendChild(li);
    });
};

const renderChart = () => {
  const canvas = document.getElementById('myChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const expenses = allTransactions.filter((t) => t.type === 'expense');
  const labels = expenses.map((e) => e.category);
  const data = expenses.map((e) => Number(e.amount));

  if (myChart) myChart.destroy();

  myChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Expenses',
        data,
        borderWidth: 1,
        backgroundColor: ['#ff4d6d', '#00e5ff', '#ffd60a', '#ff9f1c', '#f15bb5', '#60a5fa']
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
};

const loadDashboard = async () => {
  try {
    const [summary, transactions] = await Promise.all([
      apiFetch('/summary', {}, true),
      apiFetch('/transactions', {}, true)
    ]);

    allTransactions = transactions;
    document.getElementById('income').value = Number(summary.totalIncome).toFixed(2);
    document.getElementById('result').textContent =
      `Total Expenses: ₹${Number(summary.totalExpenses).toFixed(2)} | Remaining: ₹${Number(summary.remainingBudget).toFixed(2)}`;
    renderExpenseList();
    renderChart();
  } catch (error) {
    localStorage.removeItem('token');
    window.location.href = pagePath('login.html');
  }
};

if (document.getElementById('income')) {
  if (!getToken()) {
    window.location.href = pagePath('login.html');
  } else {
    loadDashboard();
  }
}

if (setIncomeBtn) {
  setIncomeBtn.addEventListener('click', async () => {
    const amount = Number(document.getElementById('income').value);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage('transactionMessage', 'Enter valid income amount.', true);
      return;
    }

    try {
      await apiFetch('/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type: 'income', category: 'Income', date: getToday() })
      }, true);

      setMessage('transactionMessage', 'Income added successfully.');
      showNotification('Income saved');
      await loadDashboard();
    } catch (error) {
      setMessage('transactionMessage', error.message, true);
    }
  });
}

if (addExpenseBtn) {
  addExpenseBtn.addEventListener('click', async () => {
    const category = document.getElementById('ename').value.trim();
    const amount = Number(document.getElementById('eamount').value);
    if (!category || !Number.isFinite(amount) || amount <= 0) {
      setMessage('transactionMessage', 'Enter valid expense name and amount.', true);
      return;
    }

    try {
      await apiFetch('/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type: 'expense', category, date: getToday() })
      }, true);

      setMessage('transactionMessage', 'Expense added successfully.');
      showNotification('Expense saved');
      document.getElementById('ename').value = '';
      document.getElementById('eamount').value = '';
      await loadDashboard();
    } catch (error) {
      setMessage('transactionMessage', error.message, true);
    }
  });
}

if (speakExpenseBtn) {
  speakExpenseBtn.addEventListener('click', () => {
    if (!('webkitSpeechRecognition' in window)) {
      setMessage('transactionMessage', 'Voice input works in Chrome browser.', true);
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.start();
    recognition.onresult = (event) => {
      document.getElementById('ename').value = event.results[0][0].transcript;
    };
  });
}

if (speakAmountBtn) {
  speakAmountBtn.addEventListener('click', () => {
    if (!('webkitSpeechRecognition' in window)) {
      setMessage('transactionMessage', 'Voice input works in Chrome browser.', true);
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.start();
    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      const number = speech.match(/\d+(\.\d+)?/);
      if (!number) {
        setMessage('transactionMessage', 'Speak a number like 200.', true);
        return;
      }
      document.getElementById('eamount').value = number[0];
    };
  });
}

if (calculateBtn) {
  calculateBtn.addEventListener('click', async () => {
    try {
      const summary = await apiFetch('/summary', {}, true);
      document.getElementById('result').textContent =
        `Total Expenses: ₹${Number(summary.totalExpenses).toFixed(2)} | Remaining: ₹${Number(summary.remainingBudget).toFixed(2)}`;
      showNotification('Budget calculated');
    } catch (error) {
      setMessage('transactionMessage', error.message, true);
    }
  });
}

quickButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const quickValue = button.getAttribute('data-quick');
    document.getElementById('ename').value = quickValue;
  });
});

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = pagePath('login.html');
  });
}
