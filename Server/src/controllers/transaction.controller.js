import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

// =====================================
// Create Transaction
// =====================================
export const createTransaction = async (req, res) => {
  try {
    const {
      title,
      amount,
      type,
      category,
      paymentMethod,
      date,
      note,
      project,
      item,
      quantity,
      unitPrice,
      invoice,
    } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, Amount, Type and Category are required.",
      });
    }

    // Check category belongs to user
    const categoryExists = await Category.findOne({ _id: category, user: req.user._id });
    if (!categoryExists) return res.status(404).json({ success: false, message: "Category not found." });

    // If project specified, ensure it belongs to user
    if (project) {
      const Project = (await import("../models/Project.js")).default;
      const projectExists = await Project.findOne({ _id: project, user: req.user._id });
      if (!projectExists) return res.status(404).json({ success: false, message: "Project not found." });
    }

    // Server-side total calculation
    const qty = Number(quantity) || 0;
    const up = Number(unitPrice) || 0;
    const computedTotal = qty > 0 && up > 0 ? qty * up : Number(amount || 0);

    const transaction = await Transaction.create({
      title,
      amount: computedTotal,
      totalAmount: computedTotal,
      type,
      category,
      paymentMethod,
      date,
      note,
      user: req.user._id,
      project: project || undefined,
      item: item || "",
      quantity: qty,
      unitPrice: up,
      invoice: invoice || undefined,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully.",
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,

    });
  }
};

// =====================================
// Get All Transactions
// =====================================
export const getTransactions = async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.project) query.project = req.query.project;

    const transactions = await Transaction.find(query).populate("category", "name icon color").populate("project", "name").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Get Single Transaction
// =====================================
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("category");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Update Transaction
// =====================================
export const updateTransaction = async (req, res) => {
  try {
    const {
      title,
      amount,
      type,
      category,
      paymentMethod,
      date,
      note,
      project,
      item,
      quantity,
      unitPrice,
      invoice,
    } = req.body;

    // Ensure category belongs to user
    const categoryExists = await Category.findOne({ _id: category, user: req.user._id });
    if (!categoryExists) return res.status(404).json({ success: false, message: "Category not found." });

    // Ensure project belongs to user
    if (project) {
      const Project = (await import("../models/Project.js")).default;
      const projectExists = await Project.findOne({ _id: project, user: req.user._id });
      if (!projectExists) return res.status(404).json({ success: false, message: "Project not found." });
    }

    const qty = Number(quantity) || 0;
    const up = Number(unitPrice) || 0;
    const computedTotal = qty > 0 && up > 0 ? qty * up : Number(amount || 0);

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        title,
        amount: computedTotal,
        totalAmount: computedTotal,
        type,
        category,
        paymentMethod,
        date,
        note,
        project: project || undefined,
        item: item || "",
        quantity: qty,
        unitPrice: up,
        invoice: invoice || undefined,
      },
      { new: true, runValidators: true }
    ).populate("category");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully.",
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Delete Transaction
// =====================================
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};