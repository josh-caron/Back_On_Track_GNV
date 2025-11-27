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

// Admin: get all hours
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

// Get volunteer statistics
export const getMyStats = async (req, res) => {
  try {
    // gather data for statistics
    const userId = req.user._id;
    const myHours = await Hours.find({ user: userId, approved: true }).populate('event');
    const totalHours = myHours.reduce((sum, h) => sum + (h.hoursWorked || 0), 0);
    const uniqueEvents = new Set(myHours.map(h => h.event?._id?.toString()).filter(Boolean));
    const eventsParticipated = uniqueEvents.size;
    
    // Calculate most active month/year
    const monthCounts = {};
    myHours.forEach(h => {
      if (h.startTime) {
        const date = new Date(h.startTime);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + (h.hoursWorked || 0);
      }
    });
    
    let mostActiveMonth = null;
    let mostActiveHours = 0;
    for (const [month, hours] of Object.entries(monthCounts)) {
      if (hours > mostActiveHours) {
        mostActiveHours = hours;
        mostActiveMonth = month;
      }
    }
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHours = myHours.filter(h => 
      h.startTime && new Date(h.startTime) >= thirtyDaysAgo
    ).reduce((sum, h) => sum + (h.hoursWorked || 0), 0);
    
    // Format monthly breakdown for graph (last 6 months)
    const monthlyBreakdown = Object.entries(monthCounts)
      .map(([month, hours]) => ({ month, hours: Math.round(hours * 100) / 100 }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // last 6 months
    
    res.json({
      totalHours: Math.round(totalHours * 100) / 100,
      eventsParticipated,
      mostActiveMonth: mostActiveMonth ? {
        month: mostActiveMonth,
        hours: Math.round(mostActiveHours * 100) / 100
      } : null,
      recentHours: Math.round(recentHours * 100) / 100,
      totalSessions: myHours.length,
      monthlyBreakdown
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error calculating stats' });
  }
};
