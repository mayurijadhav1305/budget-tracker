# 💰 Budget Tracker - Complete Project Guide

A simple **budget tracking web app** where users can sign up, log in, add income and expenses, and see where their money goes!

---

## 📁 PROJECT STRUCTURE

```
budget-tracker/
├── README.md                 (This file)
├── backend/                  (Node.js & Express server)
│   ├── server.js            
│   ├── package.json         
│   ├── schema.sql           
│   ├── .env                 (Create this - not included)
│   ├── config/
│   │   └── db.js            
│   ├── controllers/         
│   │   ├── authController.js      
│   │   └── transactionController.js    
│   ├── middleware/
│   │   └── authMiddleware.js      
│   └── routes/
│       ├── authRoutes.js         
│       └── transactionRoutes.js   
└── frontend/                 (HTML, CSS, JavaScript)
    ├── index.html           
    ├── login.html           
    ├── signup.html          
    ├── budget.html          
    ├── home.html            
    ├── script.js            
    └── style.css            
```

---

## 📄 FILE DESCRIPTIONS

### BACKEND FILES

#### **`backend/server.js`**
- **What it does:** Main server file that starts the app and connects everything together
- **Key things:** 
  - Starts Express server on port 5000
  - Connects to PostgreSQL database
  - Sets up routes for login, signup, and transactions
  - Serves frontend files

#### **`backend/package.json`**
- **What it does:** List of all Node.js packages (libraries) your app needs
- **Key packages:**
  - `express` - Web framework for creating API
  - `pg` - Talks to PostgreSQL database
  - `bcrypt` - Encrypts passwords for security
  - `jsonwebtoken` - Creates login tokens
  - `cors` - Allows frontend to call backend
  - `dotenv` - Reads `.env` file with secret settings

#### **`backend/.env`** (You must create this!)
- **What it does:** Stores secret information that should NOT be shared
- **Contains:**
  - `PORT` - Server port (usually 5000)
  - `DATABASE_URL` - How to connect to PostgreSQL
  - `JWT_SECRET` - Secret key for creating login tokens

#### **`backend/schema.sql`**
- **What it does:** Creates database tables
- **Contains:**
  - `users` table - Stores user email and password
  - `transactions` table - Stores income/expense records

#### **`backend/config/db.js`**
- **What it does:** Sets up PostgreSQL connection
- **Creates:** Connection pool to reuse database connections

#### **`backend/controllers/authController.js`**
- **What it does:** Handles **signup** and **login** logic
- **Functions:**
  - `signup()` - Creates new user account
  - `login()` - Checks email and password, gives JWT token

#### **`backend/controllers/transactionController.js`**
- **What it does:** Handles **income** and **expense** operations
- **Functions:**
  - `addTransaction()` - Add new income/expense
  - `getTransactions()` - Get all user's transactions
  - `getSummary()` - Get total income, expenses, and remaining budget for this month

#### **`backend/middleware/authMiddleware.js`**
- **What it does:** Checks if user has valid login token
- **Uses:** JWT tokens to verify user identity
- **Applied to:** All transaction routes (only logged-in users can access)

#### **`backend/routes/authRoutes.js`**
- **What it does:** Maps URLs to signup/login functions
- **Routes:**
  - `POST /signup` - Create new account
  - `POST /login` - Login to account

#### **`backend/routes/transactionRoutes.js`**
- **What it does:** Maps URLs to transaction functions
- **Routes:**
  - `POST /transactions` - Add income/expense
  - `GET /transactions` - Get list of transactions
  - `GET /summary` - Get budget summary

### FRONTEND FILES

#### **`frontend/index.html`**
- **What it does:** Landing page (home page)
- **Contains:** Welcome message, features, "Start Budgeting" button

#### **`frontend/login.html`**
- **What it does:** Login page
- **Contains:** Email and password fields to login

#### **`frontend/signup.html`**
- **What it does:** Sign up page
- **Contains:** Email and password fields to create new account

#### **`frontend/home.html`**
- **What it does:** Different home page with navbar
- **Contains:** Navigation links, how it works section, features cards

#### **`frontend/budget.html`**
- **What it does:** **Main app page** - where users manage their budget
- **Contains:**
  - Income field and button
  - Expense name and amount fields
  - Voice input buttons (speak expense name/amount)
  - List of all expenses
  - Chart showing expense breakdown
  - Budget summary (total expenses and remaining money)

#### **`frontend/script.js`**
- **What it does:** All website logic (JavaScript code)
- **Key functions:**
  - `signup()` - Handle signup form
  - `login()` - Handle login form
  - `addExpense()` - Add new expense
  - `setIncome()` - Add income
  - `loadDashboard()` - Load all user's data
  - `renderChart()` - Show expense chart
  - `renderExpenseList()` - Show list of expenses
  - Voice input functions using Web Speech API

#### **`frontend/style.css`**
- **What it does:** Makes website look nice (colors, fonts, layout)
- **Contains:** Styles for all pages and elements

---

## 🚀 STEP-BY-STEP SETUP GUIDE

### STEP 1: Install Required Software

1. **Install Node.js** (includes npm package manager)
   - Go to: https://nodejs.org
   - Download LTS version
   - Install with default settings
   - Verify: Open terminal and run `node --version`

2. **Install PostgreSQL** (database)
   - Go to: https://www.postgresql.org/download/
   - Download for your operating system
   - Install with default settings
   - Remember the password you set for user `postgres`

### STEP 2: Create Project Folders

```bash
# Create main folder
mkdir budget-tracker
cd budget-tracker

# Create backend and frontend folders
mkdir backend
mkdir frontend
```

### STEP 3: Setup Backend

```bash
# Go to backend folder
cd backend

# Create package.json
npm init -y

# Install all required packages
npm install express pg bcrypt jsonwebtoken cors dotenv
```

**If you get PowerShell execution error:**
```powershell
# Quick fix - use this command:
npm.cmd start

# Or permanent fix (recommended):
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### STEP 4: Create .env File (Very Important!)

In `backend` folder, create a file named `.env` with this content:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/budget_tracker_db
JWT_SECRET=your_secret_key_make_it_long_and_random_abc123xyz789
```

Replace `YOUR_PASSWORD` with the PostgreSQL password you set during installation.

### STEP 5: Create Database Tables

1. **Open PostgreSQL:**
   ```bash
   psql -U postgres -h localhost
   ```
   Enter your PostgreSQL password when asked

2. **Create database:**
   ```sql
   CREATE DATABASE budget_tracker_db;
   ```

3. **Connect to new database:**
   ```sql
   \c budget_tracker_db
   ```

4. **Create tables:**
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL
   );

   CREATE TABLE transactions (
     id SERIAL PRIMARY KEY,
     user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
     type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
     category VARCHAR(100) NOT NULL,
     date DATE NOT NULL
   );
   ```

5. **Exit PostgreSQL:**
   ```sql
   \q
   ```

### STEP 6: Add Backend Files

Copy these files into your `backend` folder:
- `server.js`
- `schema.sql`
- `config/db.js`
- `controllers/authController.js`
- `controllers/transactionController.js`
- `middleware/authMiddleware.js`
- `routes/authRoutes.js`
- `routes/transactionRoutes.js`

### STEP 7: Add Frontend Files

Copy these files into your `frontend` folder:
- `index.html`
- `login.html`
- `signup.html`
- `home.html`
- `budget.html` (IMPORTANT: This is the main app page)
- `script.js`
- `style.css`

---

## ▶️ HOW TO RUN THE PROJECT

### Terminal 1: Start Backend Server

```bash
# From budget-tracker/backend folder
cd backend
npm start
```

You should see:
```
Connected to PostgreSQL successfully.
Server running on http://localhost:5000
```

### Terminal 2: Start Frontend Server

```bash
# From budget-tracker root folder (NOT backend folder)
npx serve frontend
```

You should see:
```
  ┌─────────────────────────────────────┐
  │   Accepting connections at:         │
  │   http://localhost:3000             │
  └─────────────────────────────────────┘
```

Open `http://localhost:3000` in your browser.

---

## 📝 HOW TO USE THE APP

1. **Go to Home Page:** http://localhost:3000
2. **Click "Signup"** - Create new account with email and password
3. **Click "Login"** - Login with your email and password
4. **You're on Budget Page!** Now you can:
   - Add your monthly **income** (click "Set Income")
   - Add **expenses** by typing category and amount (click "Add Expense")
   - See all expenses in a **list**
   - See expenses in a **chart**
   - See **remaining budget** (income - expenses)

---

## 🔌 API ENDPOINTS

### Authentication Routes

**POST `/signup`** - Create new user
- Request body: `{ email, password }`
- Response: `{ message, user: { id, email } }`

**POST `/login`** - Login user
- Request body: `{ email, password }`
- Response: `{ message, token, user: { id, email } }`
- Token is stored in localStorage and used for all protected requests

### Transaction Routes (Require Login Token)

**POST `/transactions`** - Add income or expense
- Header: `Authorization: Bearer <token>`
- Request body: `{ amount, type: 'income' or 'expense', category, date }`
- Response: `{ message, transaction: { id, user_id, amount, type, category, date } }`

**GET `/transactions`** - Get all user's transactions
- Header: `Authorization: Bearer <token>`
- Response: Array of transactions

**GET `/summary`** - Get monthly budget summary
- Header: `Authorization: Bearer <token>`
- Response: `{ totalIncome, totalExpenses, remainingBudget }`

---

## 🛠️ QUICK REFERENCE COMMANDS

| Command | Where to Run | What it does |
|---------|-------------|------------|
| `npm init -y` | backend folder | Create package.json |
| `npm install express pg bcrypt jsonwebtoken cors dotenv` | backend folder | Install packages |
| `npm start` | backend folder | Start backend server |
| `npx serve frontend` | project root | Start frontend server |
| `psql -U postgres` | Terminal | Open PostgreSQL |
| `CREATE DATABASE budget_tracker_db;` | PostgreSQL | Create database |
| `\c budget_tracker_db` | PostgreSQL | Connect to database |
| `\i schema.sql` | PostgreSQL | Run SQL file |
| `\q` | PostgreSQL | Exit PostgreSQL |

---

## ✅ SECURITY NOTES

- **Never share your `.env` file** - it has secret information
- **Passwords are encrypted** using bcrypt (cannot be read)
- **Login tokens expire in 24 hours** for security
- **Each user's expenses are private** - they can only see their own

---

## 🐛 TROUBLESHOOTING

### Backend won't start
- Check if port 5000 is already in use: `netstat -ano | findstr :5000`
- Check `.env` file - make sure DATABASE_URL is correct
- Verify PostgreSQL is running

### Frontend shows 404
- Make sure you're running `npx serve frontend` from root folder, NOT from frontend folder
- Don't use `npx serve .` from inside frontend folder

### Can't connect to database
- Check PostgreSQL is running
- Check `.env` file has correct password
- Verify database `budget_tracker_db` exists
- Verify tables were created

### Login not working
- Check you signed up first
- Check email is in lowercase
- Check password is correct (case-sensitive)

---

## 📞 NEED HELP?

- Check error messages in browser console (F12)
- Check backend terminal for error messages
- Check `.env` file is in `backend` folder
- Make sure both servers are running
- `POST /signup`
- `POST /login`
- `POST /transactions` (JWT required)
- `GET /transactions` (JWT required)
- `GET /summary` (JWT required)

## Notes for beginners
- Passwords are hashed with `bcrypt` before storing.
- JWT token is stored in `localStorage` after login.
- Dashboard summary shows **current month** totals:
  - Total Income
  - Total Expenses
  - Remaining Budget = income - expenses

  --------------

  for start backend run :
  npm start

  for start frontend run :
  npx serve .
  