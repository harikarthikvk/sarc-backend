import { db } from "../../src/lib/db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://sarcbits.com");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method Not Allowed" });

  const id = req.query.id || req.body?.id;

  if (!id) {
    return res.status(400).json({ error: "Missing goal ID" });
  }

  try {
    const [existing] = await db.query("SELECT id FROM goals WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Goal not found" });
    }

    await db.query("DELETE FROM goals WHERE id = ?", [id]);
    return res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}