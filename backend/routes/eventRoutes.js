import express from "express";
import { getEvents, createEvent } from "../controllers/eventController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();
router.get("/", getEvents);
router.post("/", protect, adminOnly, createEvent);

export default router;
