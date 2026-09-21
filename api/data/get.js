import { db } from "../../src/lib/db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://sarcbits.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing required parameter: userId" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    const [usage] = await db.query(
      "SELECT SUM(amount) AS total_usage FROM transactions WHERE user_id = ? AND type = 'EXPENSE'",
      [userId]
    );

    const [extraIncome] = await db.query(
      "SELECT SUM(amount) AS total_extra_income FROM transactions WHERE user_id = ? AND type = 'EXTRA_INCOME'",
      [userId]
    );

    return res.status(200).json({
      transactions: rows,
      total_usage: parseFloat(usage[0].total_usage) || 0,
      total_extra_income: parseFloat(extraIncome[0].total_extra_income) || 0,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}