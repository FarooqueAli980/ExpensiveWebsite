import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createProject, getProjects, getProject, getProjectSummary, updateProject, deleteProject } from "../controllers/project.controller.js";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.get("/:id/summary", protect, getProjectSummary);
router.get("/:id", protect, getProject);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

export default router;
