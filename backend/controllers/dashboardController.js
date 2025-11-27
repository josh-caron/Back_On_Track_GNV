import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import Hours from "../models/hoursModel.js";
import Registration from "../models/registrationModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Retrieve data for dashboard
    const totalVolunteers = await User.countDocuments({ role: "volunteer" });
    const totalEvents = await Event.countDocuments();
    const totalHoursResult = await Hours.aggregate([
      { $match: { approved: true, hoursWorked: { $exists: true } } },
      { $group: { _id: null, totalHours: { $sum: "$hoursWorked" } } }
    ]);
    const totalHours = totalHoursResult[0]?.totalHours || 0;
    const pendingHours = await Hours.countDocuments({ approved: false, hoursWorked: { $exists: true } });
    const totalRegistrations = await Registration.countDocuments();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentVolunteers = await User.countDocuments({ 
      role: "volunteer", 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const upcomingEvents = await Event.countDocuments({ 
      date: { $gte: new Date() } 
    });
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

    // Most active volunteers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const topVolunteersThisMonth = await Hours.aggregate([
      { 
        $match: { 
          approved: true,
          hoursWorked: { $exists: true },
          startTime: { $gte: startOfMonth }
        } 
      },
      {
        $group: {
          _id: "$user",
          totalHours: { $sum: "$hoursWorked" },
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { totalHours: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 1,
          name: "$userInfo.name",
          email: "$userInfo.email",
          totalHours: 1,
          sessionCount: 1
        }
      }
    ]);

    res.json({
      totalVolunteers,
      totalEvents,
      totalHours: Math.round(totalHours * 10) / 10,
      pendingHours,
      totalRegistrations,
      recentVolunteers,
      upcomingEvents,
      monthlyHours,
      topVolunteersThisMonth
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error getting dashboard stats", error: error.message });
  }
};