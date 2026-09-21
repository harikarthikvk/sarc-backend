import { db } from "../../src/lib/db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://sarcbits.com");
  res.setHeader("Access-Control-Allow-Methods", "PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method Not Allowed" });

  const { id, title, amount, type } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Missing transaction ID" });
  }

  try {
    const [existing] = await db.query("SELECT * FROM transactions WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const newTitle = title ?? existing[0].title;
    const newAmount = amount ?? existing[0].amount;
    const newType = type ?? existing[0].type;

    if (newType !== "EXPENSE" && newType !== "EXTRA_INCOME") {
      return res.status(400).json({ error: "Invalid type. Must be EXPENSE or EXTRA_INCOME" });
    }

    await db.query(
      "UPDATE transactions SET title = ?, amount = ?, type = ? WHERE id = ?",
      [newTitle, newAmount, newType, id]
    );

    return res.status(200).json({ message: "Transaction updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}