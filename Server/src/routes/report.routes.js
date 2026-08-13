import express from "express";

import {
    getAllReports,
    searchTransactions,
    filterByCategory,
    filterByType,
    filterByDate
} from "../controllers/report.controller.js";
import {
    exportPdfReport,
    exportExcelReport,
    exportCsvReport,
} from "../controllers/export.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAllReports);
router.get("/search", protect, searchTransactions);
router.get("/category/:id", protect, filterByCategory);
router.get("/type/:type", protect, filterByType);
router.get("/date", protect, filterByDate);

router.get("/export/pdf", protect, exportPdfReport);
router.get("/export/excel", protect, exportExcelReport);
router.get("/export/csv", protect, exportCsvReport);

export default router;