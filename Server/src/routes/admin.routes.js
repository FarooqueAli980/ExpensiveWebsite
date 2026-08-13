import express from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { getAdminStats, getAdminUsers, updateAdminUser } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.patch("/users/:id", updateAdminUser);

export default router;
