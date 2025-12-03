// backend/routes/adminHoursRoutes.js
import express from "express";
import { createManualHours } from "../controllers/adminHoursController.js";
import { protect, adminOnly } from "../middleware/auth.js"; 

const router = express.Router();

// POST /api/admin/manual-hours
router.post("/manual-hours", protect, adminOnly, createManualHours);

export default router;

