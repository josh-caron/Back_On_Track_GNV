// MyStats: Personal volunteer stats and monthly breakdown chart.
import { useEffect, useState } from "react";

export default function MyStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setError("No authentication token");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/hours/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setStats(data);
        } else {
          setError(data.message || 'Failed to load stats');
        }
      } catch (err) {
        setError('Server error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const formatMonth = (monthStr) => {
    if (!monthStr) return "N/A";
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatMonthShort = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  if (loading) return <div className="loading-spinner">Loading your stats...</div>;
  if (error) return <div className="auth-message">❌ {error}</div>;
  if (!stats) return <div className="empty-state">No stats available yet</div>;

  // Generate all months from Jan 2025 to current month
  const generateMonthsFromJan2025 = () => {
    const months = [];
    const startDate = new Date(2025, 0, 1); // January 2025
    const now = new Date();
    
    let current = new Date(startDate);
    while (current <= now) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthKey);
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  const allMonths = generateMonthsFromJan2025();
  const monthlyData = allMonths.map(monthKey => {
    const existing = stats.monthlyBreakdown?.find(m => m.month === monthKey);
    return {
      month: monthKey,
      hours: existing ? existing.hours : 0
    };
  });

  const maxHours = Math.max(...monthlyData.map(m => m.hours), 1);

  return (
    <div className="space-y-6">
      <div className="content-header">
        <h2 className="content-title">📊 My Volunteer Stats</h2>
        <p className="content-subtitle">Your activity at a glance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card hours">
          <div className="stat-content">
            <div className="stat-icon">⏱️</div>
            <div className="stat-number">{stats.totalHours || 0}</div>
            <div className="stat-label">Total Hours</div>
            <div className="stat-change neutral">{stats.totalSessions} sessions</div>
          </div>
        </div>

        <div className="stat-card events">
          <div className="stat-content">
            <div className="stat-icon">🎪</div>
            <div className="stat-number">{stats.eventsParticipated || 0}</div>
            <div className="stat-label">Events Participated</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">🔥</div>
            <div className="stat-number" style={{fontSize:'1.5rem'}}>
              {stats.mostActiveMonth ? formatMonth(stats.mostActiveMonth.month) : 'N/A'}
            </div>
            <div className="stat-label">Most Active Month</div>
          </div>
        </div>

        <div className="stat-card registrations">
          <div className="stat-content">
            <div className="stat-icon">📅</div>
            <div className="stat-number">{stats.recentHours || 0}</div>
            <div className="stat-label">Hours in last 30 days</div>
          </div>
        </div>
      </div>

      {/* Monthly Hours Graph - Always show from Jan 2025 */}
      <div className="chart-card">
        <div className="chart-title">📈 Monthly Hours Breakdown</div>
        <div className="chart-placeholder">
          <div className="trend-line">
            {monthlyData.map((item, idx) => {
              const heightPercent = item.hours > 0 ? Math.max((item.hours / maxHours) * 100, 8) : 5;
              return (
                <div key={idx} title={`${formatMonthShort(item.month)}: ${item.hours} hours`}>
                  <div 
                    className="trend-bar" 
                    style={{ 
                      height: `${heightPercent}%`,
                      opacity: item.hours === 0 ? 0.3 : 1
                    }} 
                  />
                  <div className="text-xs mt-2 text-gray-400" style={{textAlign:'center'}}>
                    {formatMonthShort(item.month)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {stats.totalHours > 0 && (
        <div className="chart-card">
          <div className="chart-title">🎉 Achievements</div>
          <div className="space-y-1 text-sm">
            {stats.totalHours >= 100 && <div className="text-yellow-400">🏆 Century Club - 100+ hours!</div>}
            {stats.totalHours >= 50 && <div className="text-blue-400">⭐ Dedicated Volunteer - 50+ hours!</div>}
            {stats.totalHours >= 20 && <div className="text-green-400">🌟 Active Contributor - 20+ hours!</div>}
            {stats.totalHours >= 5 && <div className="text-purple-400">✨ Getting Started - 5+ hours!</div>}
            {stats.eventsParticipated >= 10 && <div className="text-pink-400">🎯 Event Explorer - 10+ events!</div>}
            {stats.eventsParticipated >= 5 && <div className="text-cyan-400">🎪 Event Enthusiast - 5+ events!</div>}
          </div>
        </div>
      )}
    </div>
  );
}