import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import hoursRoutes from "./routes/hoursRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/hours", hoursRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
