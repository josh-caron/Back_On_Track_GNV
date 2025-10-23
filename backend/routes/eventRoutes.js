import express from "express";
import { getEvents, createEvent } from "../controllers/eventController.js";
import { registerForEvent, unregisterFromEvent, getAttendees } from "../controllers/registrationController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();
router.get("/", getEvents);
router.post("/", protect, adminOnly, createEvent);

// Registration routes
router.post("/:id/register", protect, registerForEvent);
router.delete("/:id/register", protect, unregisterFromEvent);
router.get("/:id/attendees", protect, adminOnly, getAttendees);

export default router;
