import express from "express";
import { logHours, getMyHours } from "../controllers/hoursController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.post("/", protect, logHours);
router.get("/me", protect, getMyHours);

export default router;
