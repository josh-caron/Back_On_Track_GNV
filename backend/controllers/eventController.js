import Event from "../models/eventModel.js";

export const getEvents = async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
};

export const createEvent = async (req, res) => {
  const event = await Event.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(event);
};
