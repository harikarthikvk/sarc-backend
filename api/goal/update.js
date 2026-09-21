import { db } from "../../src/lib/db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://sarcbits.com");
  res.setHeader("Access-Control-Allow-Methods", "PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method Not Allowed" });

  // Extract ID from body or query string
  const { id, title, target_amount, saved_amount } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Missing goal ID" });
  }

  try {
    // Check if the goal exists in the database first
    const [existing] = await db.query("SELECT * FROM goals WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Goal not found" });
    }

    // Perform update with provided values else fall back to old values 
    const newTitle = title ?? existing[0].title;
    const newTarget = target_amount ?? existing[0].target_amount;
    const newSaved = saved_amount ?? existing[0].saved_amount;

    await db.query(
      "UPDATE goals SET title = ?, target_amount = ?, saved_amount = ? WHERE id = ?",
      [newTitle, newTarget, newSaved, id]
    );

    return res.status(200).json({ message: "Goal updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}