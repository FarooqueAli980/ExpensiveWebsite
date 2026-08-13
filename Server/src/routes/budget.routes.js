import express from "express";
import {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
} from "../controllers/budget.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createBudget);

router.get("/", protect, getBudgets);

router.get("/summary/:month/:year", protect, getBudgetSummary);

router.get("/:id", protect, getBudget);

router.put("/:id", protect, updateBudget);

router.delete("/:id", protect, deleteBudget);

export default router;