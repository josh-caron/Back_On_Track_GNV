import express from "express";
import { logHours, getMyHours, getAllHours, approveHours, checkIn, checkOut } from "../controllers/hoursController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();
// User routes
router.post("/", protect, logHours);
router.get("/me", protect, getMyHours);

// Check-in / Check-out
router.post("/checkin", protect, checkIn);
router.post("/checkout", protect, checkOut);

// Admin routes
router.get("/", protect, adminOnly, getAllHours);
router.patch("/:id/approve", protect, adminOnly, approveHours);

export default router;
