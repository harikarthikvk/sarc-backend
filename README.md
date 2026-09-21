# Expense Tracker & Goals API

A lightweight serverless backend built with Node.js and MySQL. This API enables users to track expenses and extra income, monitor their budget usage, and set and track goal-oriented savings.

---

## 🗄️ Database Schema (`schema.sql`)

Run the following SQL commands to set up the MySQL database tables:

```sql
CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  monthly_budget DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Transactions Table (Expenses & Extra Income)
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type ENUM('EXPENSE', 'EXTRA_INCOME') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Savings Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  target_amount DECIMAL(10, 2) NOT NULL,
  saved_amount DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory of your project:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expense_tracker
```

---

## 🚀 API Endpoint Documentation

Base URL: `https://your-domain.com/api`

---

### 1. User Summary & Goal Progress

#### `GET /api/user/get?userId={userId}`
Calculates net balance ($\text{Budget} - \text{Expenses} + \text{Extra Income}$) and computes goal completion percentages based on the current balance.

* **Query Parameters:** `userId` (required)
* **Response `200 OK`:**
```json
{
  "summary": {
    "set_budget": 1000.00,
    "total_expense": 300.00,
    "total_extra_income": 150.00,
    "current_balance": 850.00
  },
  "goals": [
    {
      "id": 1,
      "user_id": 1,
      "title": "New Headphones",
      "target_amount": 200,
      "current_balance": 850,
      "progress_percentage": 100,
      "is_achieved": true
    }
  ]
}
```

---

### 2. Transactions API (`/api/data`)

#### `POST /api/data/add`
Records a new expense or extra income entry.

* **Body:**
```json
{
  "user_id": 1,
  "title": "Grocery Shopping",
  "amount": 75.50,
  "type": "EXPENSE" // Options: "EXPENSE" or "EXTRA_INCOME"
}
```
* **Response `201 Created`:**
```json
{
  "id": 12,
  "message": "Transaction recorded successfully"
}
```

#### `GET /api/data/get?userId={userId}`
Fetches all recorded transactions for a specific user and calculates total expenses and extra income.

* **Query Parameters:** `userId` (required)
* **Response `200 OK`:**
```json
{
  "transactions": [
    {
      "id": 12,
      "user_id": 1,
      "title": "Grocery Shopping",
      "amount": "75.50",
      "type": "EXPENSE",
      "created_at": "2026-09-21T10:00:00.000Z"
    }
  ],
  "total_usage": 75.50,
  "total_extra_income": 0.00
}
```

#### `PATCH /api/data/update`
Updates an existing transaction.

* **Body:**
```json
{
  "id": 12,
  "title": "Weekly Grocery Shopping",
  "amount": 80.00,
  "type": "EXPENSE"
}
```
* **Response `200 OK`:**
```json
{
  "message": "Transaction updated successfully"
}
```

#### `DELETE /api/data/remove?id={id}`
Deletes a transaction by ID.

* **Query Parameters or Body:** `id` (required)
* **Response `200 OK`:**
```json
{
  "message": "Transaction deleted successfully"
}
```

---

### 3. Savings Goals API (`/api/goals`)

#### `POST /api/goals/create`
Creates a goal-oriented savings entry (e.g., "New Headphones").

* **Body:**
```json
{
  "user_id": 1,
  "title": "New Headphones",
  "target_amount": 250.00
}
```
* **Response `201 Created`:**
```json
{
  "id": 4,
  "message": "Goal created successfully"
}
```

#### `PATCH /api/goals/update`
Updates an existing savings goal.

* **Body:**
```json
{
  "id": 4,
  "title": "Wireless Headphones",
  "target_amount": 220.00,
  "saved_amount": 50.00
}
```
* **Response `200 OK`:**
```json
{
  "message": "Goal updated successfully"
}
```

#### `DELETE /api/goals/remove?id={id}`
Deletes a goal entry by ID.

* **Query Parameters or Body:** `id` (required)
* **Response `200 OK`:**
```json
{
  "message": "Goal deleted successfully"
}
```