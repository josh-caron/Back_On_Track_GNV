import Hours from "../models/hoursModel.js";

export const logHours = async (req, res) => {
  const { event, hoursWorked } = req.body;
  const hours = await Hours.create({
    user: req.user._id,
    event,
    hoursWorked,
  });
  res.status(201).json(hours);
};

export const getMyHours = async (req, res) => {
  const myHours = await Hours.find({ user: req.user._id }).populate("event");
  res.json(myHours);
};
