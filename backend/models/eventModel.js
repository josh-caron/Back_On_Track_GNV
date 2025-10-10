import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: String,
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // admin
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
