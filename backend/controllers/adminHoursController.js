// backend/controllers/adminHoursController.js
import Hours from "../models/hoursModel.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";


export const createManualHours = async (req, res) => {
  try {
    const {
      userEmail,
      eventId,
      hoursWorked,
      startTime,
      endTime,
      markApproved,
    } = req.body;

    if (!userEmail || !eventId) {
      return res
        .status(400)
        .json({ message: "userEmail and eventId are required" });
    }

    if (!hoursWorked && !(startTime && endTime)) {
      return res.status(400).json({
        message:
          "Provide either hoursWorked or a valid startTime and endTime to compute hours.",
      });
    }

    const normalizedEmail = userEmail.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with that email not found" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    let start = startTime ? new Date(startTime) : null;
    let end = endTime ? new Date(endTime) : null;
    let hours = hoursWorked;

    if (!hours && start && end) {
      const diffMs = end.getTime() - start.getTime();
      if (diffMs <= 0) {
        return res
          .status(400)
          .json({ message: "endTime must be after startTime" });
      }
      hours = diffMs / (1000 * 60 * 60); // ms -> hours
    }

    if (!hours || Number.isNaN(hours) || hours <= 0) {
      return res
        .status(400)
        .json({ message: "Computed hoursWorked must be a positive number" });
    }

    const manualHours = new Hours({
      user: user._id,
      event: event._id,
      hoursWorked: hours,
      startTime: start || null,
      endTime: end || null,
      status: "closed",
      approved: !!markApproved,
    });

    const saved = await manualHours.save();
    await saved.populate("user", "name email");
    await saved.populate("event", "name title date");

    return res.status(201).json({
      message: "Manual hours entry created successfully",
      hours: saved,
    });
  } catch (err) {
    console.error("Error creating manual hours entry:", err);
    return res
      .status(500)
      .json({ message: "Server error while creating manual hours entry" });
  }
};

export default {
  createManualHours,
};
