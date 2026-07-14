const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Transaction = require("../models/Transaction");
const Household = require("../models/Household");
const { protect } = require("../middleware/auth");

// Initialize Google Gemini Client if API Key is configured
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY") {
  genAI = new GoogleGenerativeAI(apiKey);
}

const VALID_CATEGORIES = [
  "Food & Dining",
  "Rent & Housing",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Other"
];

// Helper: Calculate mock-analysis context from user transaction list
function calculateMockMetrics(txns) {
  let income = 0;
  let expense = 0;
  const cats = {};

  txns.forEach(t => {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    }
  });

  return { income, expense, cats };
}

// ── 1. POST /api/v1/ai/chat ──────────────────────────────────────────
router.post("/chat", protect, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: "Message content is required" });
  }

  try {
    // 1. Gather all context transactions (personal + active household shared)
    const userHousehold = await Household.findOne({
      "members.userId": req.user._id,
    });

    let query = {};
    if (userHousehold) {
      query = {
        $or: [
          { userId: req.user._id },
          { householdId: userHousehold._id }
        ]
      };
    } else {
      query = { userId: req.user._id };
    }

    const txns = await Transaction.find(query).sort({ date: -1 });

    // 2. Format Context
    const metrics = calculateMockMetrics(txns);

    // If Gemini Client is configured, run live LLM call
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const contextStr = txns.slice(0, 100).map(t => 
          `- Date: ${t.date.toISOString().split('T')[0]}, Cat: ${t.category}, Type: ${t.type}, Amt: ₹${t.amount}, Note: ${t.note || "None"}`
        ).join("\n");

        const prompt = `You are WealthifyMe AI, a premium, secure, and expert personal finance advisor.
Analyze the user's financial transaction history and answer their questions contextually.
Keep answers under 200 words. Use clear markdown headers, bullet points, and tables.
If the user asks questions unrelated to finance, politely redirect them.

Current Context:
- User Name: ${req.user.name || "User"}
- Household Shared: ${userHousehold ? `Active (${userHousehold.name})` : "None"}
- Total Logs: ${txns.length}
- Total Income: ₹${metrics.income}
- Total Expense: ₹${metrics.expense}
- Net Balance: ₹${metrics.income - metrics.expense}

Recent Transactions (max 100):
${contextStr || "No transactions logged yet."}

User Question: ${message}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return res.json({ reply: responseText, isMock: false });
      } catch (geminiErr) {
        console.error("Gemini API call failed, falling back to mock:", geminiErr.message);
      }
    }

    // 3. Fallback Mock Advisor Logic
    const normalizedMsg = message.toLowerCase();
    let reply = "";

    if (normalizedMsg.includes("summar") || normalizedMsg.includes("spend") || normalizedMsg.includes("trend") || normalizedMsg.includes("chart")) {
      reply = `### 📊 Financial Summary for **${req.user.name || "User"}**

Here is a quick overview of your logged transactions:

| Metric | Amount |
| :--- | :--- |
| **Total Income** | ₹${metrics.income.toFixed(2)} |
| **Total Expenses** | ₹${metrics.expense.toFixed(2)} |
| **Net Savings** | **₹${(metrics.income - metrics.expense).toFixed(2)}** |

#### Expense Breakdown by Category:
${Object.keys(metrics.cats).length === 0 
  ? "*No expenses logged yet.*" 
  : Object.entries(metrics.cats)
      .map(([cat, val]) => `- **${cat}**: ₹${val.toFixed(2)} (${((val / metrics.expense) * 100).toFixed(0)}%)`)
      .join("\n")
}

*💡 Tip: Your highest expense category is **${Object.keys(metrics.cats).sort((a,b) => metrics.cats[b] - metrics.cats[a])[0] || "None"}**. Consider tracking this area closely next month to build your savings.*

*(Mock Assistant Mode: Configure a valid GEMINI_API_KEY in the backend .env to enable active AI reasoning).*`;
    } else if (normalizedMsg.includes("budget") || normalizedMsg.includes("limit") || normalizedMsg.includes("saving")) {
      const savingsRate = metrics.income > 0 ? ((metrics.income - metrics.expense) / metrics.income) * 100 : 0;
      reply = `### 🛡️ Budget & Savings Analysis

Based on your current transaction history:

* **Savings Rate**: ${savingsRate.toFixed(1)}% of your income is being saved.
* **Active Household**: ${userHousehold ? `Yes (${userHousehold.name})` : "No active household shared"}.

#### 💡 Actionable Insights:
1. **Reduce Variable Spend**: Try capping variable expenditures (e.g. Shopping, Entertainment) at 20% of your net income.
2. **Emergency Fund**: Set aside ₹${(metrics.expense * 3).toFixed(2)} (equivalent to 3 months of expenses) in a high-yield savings vault.
3. **Automate Savings**: Move 10% of your salary directly to investments immediately when your paycheck is logged.

*(Mock Assistant Mode: Configure a valid GEMINI_API_KEY in the backend .env to enable active AI reasoning).*`;
    } else {
      reply = `### 👋 Hello! I am your **WealthifyMe AI Assistant**.

I am here to help you analyze your financial health, track budgets, and optimize your spending habits.

Here is what you can ask me:
* *"Summarize my spending trends"*
* *"Analyze my savings rate"*
* *"Suggest a budget plan"*

Currently, you have **${txns.length} transactions** logged in your workspace database. 

*(Note: Live AI reasoning is currently disabled. Add a valid \`GEMINI_API_KEY\` to your backend \`.env\` file to launch full natural language processing).*`;
    }

    return res.json({ reply, isMock: true });

  } catch (err) {
    console.error("AI assistant request failed:", err);
    res.status(500).json({ message: "AI assistant processed with errors." });
  }
});

// ── 2. POST /api/v1/ai/categorize ─────────────────────────────────────
router.post("/categorize", protect, async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ message: "Transaction description is required" });
  }

  try {
    // If Gemini client is available, attempt real prediction
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are a financial transaction categorization module.
Classify the following transaction description into exactly one of these categories:
["Food & Dining", "Rent & Housing", "Transport", "Shopping", "Entertainment", "Health", "Education", "Salary", "Freelance", "Business", "Investment", "Other"]

Transaction Description: "${description}"

Return ONLY the selected category string. Do not include markdown, explanations, or quotes.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        // Find matching category in our valid list
        const matched = VALID_CATEGORIES.find(c => c.toLowerCase() === text.toLowerCase());
        if (matched) {
          return res.json({ category: matched, isMock: false });
        }
      } catch (geminiErr) {
        console.error("Gemini categorization failed, using fallback regex:", geminiErr.message);
      }
    }

    // Regex Fallback Rules
    const descLower = description.toLowerCase();
    let category = "Other";

    if (/\b(coffee|starbucks|food|restaurant|dinner|lunch|subway|burger|pizza|zomato|swiggy|grocery|groceries|eat|cafe|bistro|cafeteria|maggi|supermarket)\b/.test(descLower)) {
      category = "Food & Dining";
    } else if (/\b(rent|house|room|landlord|apartment|maintenance|lease|flat|stay)\b/.test(descLower)) {
      category = "Rent & Housing";
    } else if (/\b(uber|ola|cab|taxi|train|bus|fuel|petrol|gas|flight|ticket|metro|auto|rapido|toll|parking|garage)\b/.test(descLower)) {
      category = "Transport";
    } else if (/\b(amazon|shopping|shoes|clothes|target|walmart|myntra|flipkart|mall|dress|shirt|pants|gift|gifts)\b/.test(descLower)) {
      category = "Shopping";
    } else if (/\b(movie|netflix|game|spotify|concert|party|club|pub|bar|drinks|theatre|youtube|premium|playstation|xbox|steam)\b/.test(descLower)) {
      category = "Entertainment";
    } else if (/\b(doctor|medicine|pharmacy|hospital|clinic|dentist|health|meds|checkup|optical)\b/.test(descLower)) {
      category = "Health";
    } else if (/\b(tuition|course|book|school|college|udemy|coursera|exam|fees|study)\b/.test(descLower)) {
      category = "Education";
    } else if (/\b(salary|paycheck|wage|wages|dividend|salary-credit)\b/.test(descLower)) {
      category = "Salary";
    } else if (/\b(upwork|fiverr|freelance|gig|contract|payout)\b/.test(descLower)) {
      category = "Freelance";
    } else if (/\b(stock|crypto|profit|mutual fund|investment|invest|groww|zerodha|trading|coin|bitcoin|eth)\b/.test(descLower)) {
      category = "Investment";
    } else if (/\b(business|client|invoice|sale|revenue)\b/.test(descLower)) {
      category = "Business";
    }

    return res.json({ category, isMock: true });

  } catch (err) {
    console.error("AI categorization failed:", err);
    res.status(500).json({ message: "Failed to categorize transaction." });
  }
});

module.exports = router;
