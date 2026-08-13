import express from "express";
import {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Transaction route working",
  });
});

router.post("/", protect, createTransaction);

router.get("/", protect, getTransactions);

router.get("/:id", protect, getTransaction);

router.put("/:id", protect, updateTransaction);

router.delete("/:id", protect, deleteTransaction);

export default router;