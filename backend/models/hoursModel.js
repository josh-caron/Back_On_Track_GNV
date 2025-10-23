import mongoose from "mongoose";

const hoursSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  hoursWorked: { type: Number },
  startTime: { type: Date },
  endTime: { type: Date },
  status: { type: String, enum: ["open", "closed"], default: "closed" },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Hours", hoursSchema);
