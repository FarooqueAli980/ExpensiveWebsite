import express from "express";
import {
  getDashboardSummary,
  getRecentTransactions,
  getIncomeExpense,
  getExpenseByCategory,
  getMonthlyAnalytics,
} from "../controllers/dashboard.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/summary", protect, getDashboardSummary);

router.get("/recent", protect, getRecentTransactions);

router.get("/income-expense", protect, getIncomeExpense);

router.get("/expense-category", protect, getExpenseByCategory);

router.get("/monthly", protect, getMonthlyAnalytics);

export default router;