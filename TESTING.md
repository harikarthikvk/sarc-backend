# Testing & Deployment Guide

This guide covers testing your live backend deployed on Vercel and explains key considerations when hosting on Vercel and free database providers.

- **Live API Base URL:** `https://sarc-backend-eight.vercel.app`

---

## 1. Sequential API Test Suite (`curl`)

Run these commands in order to test all CRUD functionality and ensure database foreign key constraints are met.

### Step 1: Create a Test User
*Required first so `user_id: 1` exists in the database.*

```bash
curl -X POST [https://sarc-backend-eight.vercel.app/api/user/create](https://sarc-backend-eight.vercel.app/api/user/create) \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "monthly_budget": 500.00}'

```

---

### Step 2: Test Goals (`/api/goal/*`)

**Create Goal #1 ("New Headphones"):**

```bash
curl -X POST [https://sarc-backend-eight.vercel.app/api/goal/create](https://sarc-backend-eight.vercel.app/api/goal/create) \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "title": "New Headphones", "target_amount": 150.00}'

```

**Create Goal #2 ("Emergency Fund"):**

```bash
curl -X POST [https://sarc-backend-eight.vercel.app/api/goal/create](https://sarc-backend-eight.vercel.app/api/goal/create) \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "title": "Emergency Fund", "target_amount": 1000.00}'

```

**Update Goal #1:**

```bash
curl -X PATCH [https://sarc-backend-eight.vercel.app/api/goal/update](https://sarc-backend-eight.vercel.app/api/goal/update) \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "title": "Wireless ANC Headphones", "target_amount": 180.00}'

```

**Delete Goal #2:**

```bash
curl -X DELETE "[https://sarc-backend-eight.vercel.app/api/goal/remove?id=2](https://sarc-backend-eight.vercel.app/api/goal/remove?id=2)"

```

---

### Step 3: Test Transactions / Data (`/api/data/*`)

**Add Expense #1:**

```bash
curl -X POST [https://sarc-backend-eight.vercel.app/api/data/add](https://sarc-backend-eight.vercel.app/api/data/add) \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "title": "Weekly Groceries", "amount": 65.50, "type": "EXPENSE"}'

```

**Add Expense #2:**

```bash
curl -X POST [https://sarc-backend-eight.vercel.app/api/data/add](https://sarc-backend-eight.vercel.app/api/data/add) \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "title": "WiFi Subscription", "amount": 40.00, "type": "EXPENSE"}'

```

**Add Extra Income:**

```bash
curl -X POST [https://sarc-backend-eight.vercel.app/api/data/add](https://sarc-backend-eight.vercel.app/api/data/add) \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "title": "Freelance Web Design", "amount": 250.00, "type": "EXTRA_INCOME"}'

```

**Fetch Transactions:**

```bash
curl -X GET "[https://sarc-backend-eight.vercel.app/api/data/get?userId=1](https://sarc-backend-eight.vercel.app/api/data/get?userId=1)"

```

**Update Transaction #1:**

```bash
curl -X PATCH [https://sarc-backend-eight.vercel.app/api/data/update](https://sarc-backend-eight.vercel.app/api/data/update) \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "title": "Weekly Groceries (Updated)", "amount": 72.00, "type": "EXPENSE"}'

```

**Delete Transaction #2:**

```bash
curl -X DELETE "[https://sarc-backend-eight.vercel.app/api/data/remove?id=2](https://sarc-backend-eight.vercel.app/api/data/remove?id=2)"

```

---

### Step 4: Test Summary & Goal Progress (`/api/user/*`)

**Get Current Balance and Progress %:**

```bash
curl -X GET "[https://sarc-backend-eight.vercel.app/api/user/get?userId=1](https://sarc-backend-eight.vercel.app/api/user/get?userId=1)"

```

---

## 2. Deployment Notes (Vercel & Free Database Hosting)

When running a Node.js API with a MySQL database on Vercel's Serverless platform and free database tiers (e.g., PlanetScale, Aiven, Supabase, Railway, Clever Cloud), keep the following behavior in mind:

### 1. Cold Starts

Serverless functions shut down when inactive. The first API request after a period of inactivity may take **2 to 5 seconds** while the serverless environment spins up and opens a connection to the database.

### 2. Database Sleeping & Inactivity

Free database hosting tiers often spin down or pause instances if no queries are executed for several hours/days. When this happens:

* The initial API request might fail with a **Connection Timeout** or `ECONNREFUSED` error.
* Making a second request usually wakes the database back up.

### 3. Connection Limits

Serverless functions execute statelessly and can spawn multiple instances concurrently.

* Traditional MySQL connection pools (`mysql2.createPool`) can quickly exhaust free database connection limits (e.g., max 5–10 connections).
* Set `connectionLimit: 2` or `3` in `src/lib/db.js` to avoid connection limit errors.

### 4. Vercel Execution Timeouts

* **Vercel Hobby Tier:** Serverless functions have a **10-second maximum timeout**. If a database response or cold start takes longer than 10 seconds, Vercel will return a `504 Gateway Timeout`.

```
