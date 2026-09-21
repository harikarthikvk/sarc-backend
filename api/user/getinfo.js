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
    // Fetch user's set budget
    const [users] = await db.query("SELECT monthly_budget FROM users WHERE id = ?", [userId]);
    if (users.length === 0) return res.status(404).json({ error: "User not found" });
    
    const setBudget = parseFloat(users[0].monthly_budget) || 0;

    // Fetch sum of expenses and extra income
    const [totals] = await db.query(
      `SELECT 
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS total_expense,
        SUM(CASE WHEN type = 'EXTRA_INCOME' THEN amount ELSE 0 END) AS total_extra_income
       FROM transactions 
       WHERE user_id = ?`,
      [userId]
    );

    const totalExpense = parseFloat(totals[0].total_expense) || 0;
    const totalExtraIncome = parseFloat(totals[0].total_extra_income) || 0;

    // Set Budget - Total Expenses + Total Extra Income =  Current balance
    const currentBalance = setBudget - totalExpense + totalExtraIncome;

    // Fetch user goals and calculate progress percentage based on current balance
    const [goals] = await db.query("SELECT * FROM goals WHERE user_id = ?", [userId]);

    const goalsWithProgress = goals.map((goal) => {
      const target = parseFloat(goal.target_amount);
      const percentage = target > 0 ? Math.min(100, (currentBalance / target) * 100) : 0;
      
      return {
        ...goal,
        target_amount: target,
        current_balance: currentBalance,
        progress_percentage: Math.max(0, parseFloat(percentage.toFixed(2))),
        is_achieved: currentBalance >= target
      };
    });

    return res.status(200).json({
      summary: {
        set_budget: setBudget,
        total_expense: totalExpense,
        total_extra_income: totalExtraIncome,
        current_balance: currentBalance
      },
      goals: goalsWithProgress
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}