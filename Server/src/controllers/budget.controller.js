import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import mongoose from 'mongoose';

// =========================================
// Create Budget
// =========================================
export const createBudget = async (req, res) => {
  try {
    const { month, year, amount, project } = req.body;
    if (!month || !year || !amount || !project) {
      return res.status(400).json({
        success: false,
        message: "Month, Year and Amount are required.",
      });
    }

    // ensure project belongs to user
    const Project = (await import("../models/Project.js")).default;
    const projectExists = await Project.findOne({ _id: project, user: req.user._id });
    if (!projectExists) return res.status(404).json({ success: false, message: "Project not found." });

    const existingBudget = await Budget.findOne({ user: req.user._id, project, month, year });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: "Budget already exists for this month.",
      });
    }

    try {
      const budget = await Budget.create({
        month,
        year,
        amount,
        user: req.user._id,
        project,
      });

      return res.status(201).json({
        success: true,
        message: "Budget created successfully.",
        budget,
      });
    } catch (err) {
      // Handle duplicate key error (E11000) gracefully
      if (err && err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'A budget for this user/project/month/year already exists.',
          details: err.keyValue || undefined,
        });
      }
      throw err;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Get All Budgets
// =========================================
export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.user._id,
    }).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      total: budgets.length,
      budgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Get Single Budget
// =========================================
export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    res.status(200).json({
      success: true,
      budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Update Budget
// =========================================
export const updateBudget = async (req, res) => {
  try {
    const { month, year, amount, project } = req.body;

    if (!month || !year || !amount || !project) {
      return res.status(400).json({
        success: false,
        message: "Month, Year, Amount and Project are required.",
      });
    }

    const Project = (await import("../models/Project.js")).default;
    const projectExists = await Project.findOne({ _id: project, user: req.user._id });
    if (!projectExists) return res.status(404).json({ success: false, message: "Project not found." });

    const duplicateBudget = await Budget.findOne({
      _id: { $ne: req.params.id },
      user: req.user._id,
      project,
      month,
      year,
    });

    if (duplicateBudget) {
      return res.status(400).json({
        success: false,
        message: "Budget already exists for this month.",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        month,
        year,
        amount,
        project,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget updated successfully.",
      budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Delete Budget
// =========================================
export const deleteBudget = async (req, res) => {
  try {
    console.log(`DELETE /api/budgets/${req.params.id} requested by user ${req.user?._id}`);

    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ success: false, message: "Budget not found." });
    if (String(budget.user) !== String(req.user._id)) return res.status(403).json({ success: false, message: "Not authorized to delete this budget." });

    await Budget.deleteOne({ _id: budget._id });

    res.status(200).json({ success: true, message: "Budget deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Budget Summary
// =========================================
export const getBudgetSummary = async (req, res) => {
  try {
    const month = Number(req.params.month);
    const year = Number(req.params.year);
    const project = req.query.project;

    const budgetQuery = { user: req.user._id, month, year };
    if (project) {
      const normalizedProject = mongoose.isValidObjectId(project) ? new mongoose.Types.ObjectId(project) : project;
      budgetQuery.project = normalizedProject;
    }

    const budget = project ? await Budget.findOne(budgetQuery) : await Budget.find(budgetQuery);

    if (!budget || (Array.isArray(budget) && budget.length === 0)) {
      return res.status(404).json({ success: false, message: "Budget not found." });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const spentQuery = {
      user: req.user._id,
      type: 'Expense',
      date: { $gte: startDate, $lte: endDate },
    };

    if (project) {
      spentQuery.project = mongoose.isValidObjectId(project) ? new mongoose.Types.ObjectId(project) : project;
    }

    const txs = await Transaction.find(spentQuery).select('amount');
    const spent = txs.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    if (Array.isArray(budget)) {
      const totalBudget = budget.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const remaining = totalBudget - spent;
      let status = 'Within Budget';

      if (remaining < 0) {
        status = 'Budget Exceeded';
      } else if (totalBudget > 0 && spent / totalBudget >= 0.8) {
        status = 'Near Limit';
      }

      return res.status(200).json({ success: true, budget: totalBudget, spent, remaining, status });
    }

    const totalBudget = Number(budget.amount || 0);
    const remaining = totalBudget - spent;
    let status = 'Within Budget';

    if (remaining < 0) {
      status = 'Budget Exceeded';
    } else if (totalBudget > 0 && spent / totalBudget >= 0.8) {
      status = 'Near Limit';
    }

    res.status(200).json({ success: true, budget: totalBudget, spent, remaining, status });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};