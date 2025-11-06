import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import Hours from "../models/hoursModel.js";
import Registration from "../models/registrationModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Get total volunteers
    const totalVolunteers = await User.countDocuments({ role: "volunteer" });
    
    // Get total events
    const totalEvents = await Event.countDocuments();
    
    // Get total hours (approved)
    const totalHoursResult = await Hours.aggregate([
      { $match: { approved: true, hoursWorked: { $exists: true } } },
      { $group: { _id: null, totalHours: { $sum: "$hoursWorked" } } }
    ]);
    const totalHours = totalHoursResult[0]?.totalHours || 0;
    
    // Get pending hours for approval
    const pendingHours = await Hours.countDocuments({ approved: false, hoursWorked: { $exists: true } });
    
    // Get total registrations
    const totalRegistrations = await Registration.countDocuments();
    
    // Get recent volunteer activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentVolunteers = await User.countDocuments({ 
      role: "volunteer", 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    // Get upcoming events
    const upcomingEvents = await Event.countDocuments({ 
      date: { $gte: new Date() } 
    });
    
    // Monthly hours trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyHours = await Hours.aggregate([
      { 
        $match: { 
          approved: true, 
          hoursWorked: { $exists: true },
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalHours: { $sum: "$hoursWorked" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      totalVolunteers,
      totalEvents,
      totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
      pendingHours,
      totalRegistrations,
      recentVolunteers,
      upcomingEvents,
      monthlyHours
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error getting dashboard stats", error: error.message });
  }
};