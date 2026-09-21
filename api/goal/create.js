import { db } from "../../src/lib/db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://sarcbits.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { user_id, title, target_amount } = req.body;

  if (!user_id || !title || !target_amount) {
    return res.status(400).json({ error: "Missing required fields: user_id, title, or target_amount" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO goals (user_id, title, target_amount) VALUES (?, ?, ?)",
      [user_id, title, target_amount]
    );
    return res.status(201).json({ id: result.insertId, message: "Goal created successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}