import Registration from "../models/registrationModel.js";
import Event from "../models/eventModel.js";

// Register the authenticated user for an event
export const registerForEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user._id;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: "Event not found" });

  // If event has a capacity, check current registration count
  if (typeof event.capacity === 'number') {
    const currentCount = await Registration.countDocuments({ event: eventId });
    if (currentCount >= event.capacity) {
      return res.status(409).json({ message: 'Event is at capacity' });
    }
  }

  try {
    const reg = await Registration.create({ user: userId, event: eventId });
    return res.status(201).json(reg);
  } catch (err) {
    // Duplicate registration - return existing registration
    if (err.code === 11000) {
      const existing = await Registration.findOne({ user: userId, event: eventId });
      return res.status(200).json({ message: "Already registered", registration: existing });
    }
    throw err;
  }
};

// Unregister the authenticated user from an event
export const unregisterFromEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user._id;

  const deleted = await Registration.findOneAndDelete({ user: userId, event: eventId });
  if (!deleted) return res.status(404).json({ message: "Registration not found" });
  res.json({ message: "Unregistered" });
};

// Admin: list attendees for an event
export const getAttendees = async (req, res) => {
  const eventId = req.params.id;
  const regs = await Registration.find({ event: eventId }).populate("user", "name email");
  res.json(regs);
};

// Get registrations for the authenticated user
export const getMyRegistrations = async (req, res) => {
  const userId = req.user._id;
  const regs = await Registration.find({ user: userId }).populate("event");
  res.json(regs);
};
