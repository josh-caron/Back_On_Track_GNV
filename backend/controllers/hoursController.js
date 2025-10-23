import Hours from "../models/hoursModel.js";

export const logHours = async (req, res) => {
  const { event, hoursWorked } = req.body;
  const hours = await Hours.create({
    user: req.user._id,
    event,
    hoursWorked,
    status: hoursWorked ? "closed" : "open",
  });
  res.status(201).json(hours);
};

export const getMyHours = async (req, res) => {
  const myHours = await Hours.find({ user: req.user._id }).populate("event");
  res.json(myHours);
};

// Admin: get all hours (optionally filter by approved=false)
export const getAllHours = async (req, res) => {
  const { approved } = req.query;
  const filter = {};
  if (approved === "true") filter.approved = true;
  if (approved === "false") filter.approved = false;
  const allHours = await Hours.find(filter).populate("user event").sort({ createdAt: -1 });
  res.json(allHours);
};

// Admin: approve a specific hours entry
export const approveHours = async (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;
  if (typeof approved !== 'boolean') return res.status(400).json({ message: 'approved must be boolean' });
  const hours = await Hours.findById(id);
  if (!hours) return res.status(404).json({ message: "Hours entry not found" });
  hours.approved = approved;
  await hours.save();
  res.json({ message: `Hours ${approved ? 'approved' : 'unapproved'}`, hours });
};

// Check-in: start a session for an event
export const checkIn = async (req, res) => {
  const { event } = req.body;
  // Prevent multiple open sessions for same user/event
  const existingOpen = await Hours.findOne({ user: req.user._id, event, status: "open" });
  if (existingOpen) return res.status(400).json({ message: "Already checked in for this event" });

  const h = await Hours.create({ user: req.user._id, event, startTime: new Date(), status: "open" });
  res.status(201).json(h);
};

// Check-out: close the open session, compute hoursWorked
export const checkOut = async (req, res) => {
  const { event } = req.body;
  const open = await Hours.findOne({ user: req.user._id, event, status: "open" });
  if (!open) return res.status(404).json({ message: "No open check-in found for this event" });

  open.endTime = new Date();
  const diffMs = open.endTime - open.startTime;
  const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // rounded to 2 decimals
  open.hoursWorked = hoursWorked;
  open.status = "closed";
  await open.save();
  res.json(open);
};
