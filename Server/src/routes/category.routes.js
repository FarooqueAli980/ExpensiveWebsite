import express from "express";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createCategory);

router.get("/", protect, getCategories);

router.get("/:id", protect, getCategory);   

router.put("/:id", protect, updateCategory);

router.delete("/:id", protect, deleteCategory);

export default router;