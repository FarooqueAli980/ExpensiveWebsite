import express from "express";

import {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
} from "../controllers/auth.controller.js";
import { forgotPassword, resetPassword } from "../controllers/password.controller.js";
import {
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/profile.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// Email verification routes removed — registration/login no longer require email verification

// Protected Routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single('profileImage'), updateProfile);
router.put("/profile/password", protect, changePassword);
router.delete("/profile", protect, deleteAccount);
router.post("/logout", protect, logoutUser);

export default router;