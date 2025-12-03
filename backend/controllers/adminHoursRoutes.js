// backend/routes/adminHoursRoutes.js
import express from "express";
import { createManualHours } from "../controllers/adminHoursController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Simple admin guard in case you don't already have an admin-only middleware
const requireAdmin = (req, res, next) => {
  // assumes protect() has already attached the user to req.user
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

// POST /api/admin/manual-hours
router.post("/manual-hours", protect, requireAdmin, createManualHours);

export default router;
