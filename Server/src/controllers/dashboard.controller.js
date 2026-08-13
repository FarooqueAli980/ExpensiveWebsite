import Transaction from "../models/Transaction.js";

// =========================================
// Dashboard Summary
// =========================================
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get All Transactions
    const transactions = await Transaction.find({ user: userId });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((item) => {
      const amt = Number(item.amount ?? item.totalAmount ?? 0);
      if (item.type === "Income") totalIncome += amt;
      else totalExpense += amt;
    });

    const balance = Number(totalIncome) - Number(totalExpense);

    // Aggregate by project: total budget and spent
    const Budget = (await import("../models/Budget.js")).default;
    const Project = (await import("../models/Project.js")).default;

    const projects = await Project.find({ user: userId });

    const projectsSummary = await Promise.all(projects.map(async (p) => {
      const spent = await Transaction.aggregate([
        { $match: { user: userId, project: p._id, type: 'Expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const totalSpent = (spent[0] && spent[0].total) || 0;
      const budgets = await Budget.find({ user: userId, project: p._id });
      const totalBudget = budgets.reduce((s, b) => s + Number(b.amount || 0), 0);
      const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
      let status = 'Within Budget';
      if (utilization >= 100) status = 'Budget Exceeded';
      else if (utilization >= 80) status = 'Near Limit';
      return { projectId: p._id, name: p.name, totalBudget, totalSpent, utilization, status };
    }));

    res.status(200).json({ success: true, summary: { balance, totalIncome, totalExpense, totalTransactions: transactions.length, projects: projectsSummary } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Recent Transactions
// =========================================
export const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    })
      .populate("category", "name icon color")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Income vs Expense
// =========================================
export const getIncomeExpense = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    });

    let income = 0;
    let expense = 0;

    transactions.forEach((item) => {
      const amt = Number(item.amount || 0);
      if (item.type === "Income") {
        income += amt;
      } else {
        expense += amt;
      }
    });

    res.status(200).json({
      success: true,
      income,
      expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Expense By Category
// =========================================
export const getExpenseByCategory = async (req, res) => {
  try {
    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "Expense",
          category: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$category",
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Monthly Analytics
// =========================================
export const getMonthlyAnalytics = async (req, res) => {
  try {
    const monthly = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$date",
            },
          },
          total: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      monthly,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};