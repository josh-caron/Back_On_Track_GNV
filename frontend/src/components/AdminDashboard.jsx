// AdminDashboard: Admin overview, hours approval, and event creation.
import { useEffect, useState } from "react";

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const [hours, setHours] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [creating, setCreating] = useState(false);
  const [eventForm, setEventForm] = useState({ name: "", date: "", capacity: "", location: "", description: "" });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchDashboardStats = async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setStats(data);
      else setMessage(data.message || 'Failed to load stats');
    } catch (err) {
      setMessage('Server error');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchPendingHours = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/hours?approved=false', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setHours(data);
      else setMessage(data.message || 'Failed to load hours');
    } catch (err) {
      setMessage('Server error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    if (tab === 'approve') fetchPendingHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id, approved) => {
    if (!token) { setMessage('Missing token'); return; }
    try {
      const res = await fetch(`/api/hours/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approved }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || (approved ? 'Approved' : 'Unapproved'));
        fetchPendingHours();
      } else setMessage(data.message || 'Action failed');
    } catch (err) { setMessage('Server error'); }
  };

  const handleChange = (e) => setEventForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!token) { setMessage('Missing token'); return; }
    setCreating(true);
    setMessage('');
    try {
      const body = { ...eventForm };
      if (body.capacity === "") delete body.capacity;
      else body.capacity = Number(body.capacity);
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Event created');
        setEventForm({ name: '', date: '', capacity: '', location: '', description: '' });
      } else setMessage(data.message || 'Create failed');
    } catch (err) { setMessage('Server error'); }
    setCreating(false);
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Back On Track GNV Management</p>
        </div>
        <div className="dashboard-header-right">
          <button className="logout-button" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button 
          className={`nav-tab ${tab === 'overview' ? 'active' : ''}`} 
          onClick={() => setTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-tab ${tab === 'approve' ? 'active' : ''}`} 
          onClick={() => setTab('approve')}
        >
          ✅ Approve Hours
        </button>
        <button 
          className={`nav-tab ${tab === 'create' ? 'active' : ''}`} 
          onClick={() => setTab('create')}
        >
          📅 Create Event
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="dashboard-content">
          {statsLoading ? (
            <div className="loading-spinner">Loading dashboard data...</div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card volunteers">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.totalVolunteers || 0}</div>
                    <div className="stat-label">Total Volunteers</div>
                    <div className="stat-change positive">+{stats.recentVolunteers || 0} this month</div>
                  </div>
                </div>

                <div className="stat-card events">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.totalEvents || 0}</div>
                    <div className="stat-label">Total Events</div>
                    <div className="stat-change positive">{stats.upcomingEvents || 0} upcoming</div>
                  </div>
                </div>

                <div className="stat-card hours">
                  <div className="stat-icon">⏰</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.totalHours || 0}h</div>
                    <div className="stat-label">Total Hours</div>
                    <div className="stat-change neutral">{stats.pendingHours || 0} pending</div>
                  </div>
                </div>

                <div className="stat-card registrations">
                  <div className="stat-icon">📝</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.totalRegistrations || 0}</div>
                    <div className="stat-label">Registrations</div>
                    <div className="stat-change positive">All time</div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-grid">
                <div className="chart-card">
                  <h3 className="chart-title">Volunteer Hours Trend</h3>
                  <div className="chart-placeholder">
                    <div className="trend-line">
                      {stats.monthlyHours?.map((month, index) => (
                        <div 
                          key={index} 
                          className="trend-bar" 
                          style={{ 
                            height: `${Math.min(month.totalHours * 2, 100)}px`,
                            backgroundColor: index % 2 === 0 ? '#6366f1' : '#8b5cf6'
                          }}
                          title={`${month.totalHours} hours`}
                        />
                      )) || Array(6).fill(0).map((_, i) => (
                        <div 
                          key={i} 
                          className="trend-bar" 
                          style={{ height: `${Math.random() * 60 + 20}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">🏆 Top Volunteers This Month</h3>
                  <div style={{ padding: '1rem 0' }}>
                    {stats.topVolunteersThisMonth && stats.topVolunteersThisMonth.length > 0 ? (
                      <div className="space-y-3">
                        {stats.topVolunteersThisMonth.map((volunteer, idx) => (
                          <div 
                            key={volunteer._id} 
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="flex items-center justify-center"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#fb923c' : '#475569',
                                  fontSize: '1.2rem'
                                }}
                              >
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                              </div>
                              <div>
                                <div className="font-semibold" style={{ color: '#e2e8f0' }}>
                                  {volunteer.name || volunteer.email}
                                </div>
                                <div className="text-xs" style={{ color: '#94a3b8' }}>
                                  {volunteer.sessionCount} session{volunteer.sessionCount !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className="font-bold" style={{ color: '#10b981', fontSize: '1.1rem' }}>
                              {Math.round(volunteer.totalHours * 10) / 10}h
                            </div>
                          </div>
                        ))}
                        {stats.topVolunteersThisMonth.length > 0 && (
                          <div className="text-center pt-2" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            🌟 Volunteer of the Month: <span style={{ color: '#fbbf24', fontWeight: 600 }}>{stats.topVolunteersThisMonth[0]?.name || stats.topVolunteersThisMonth[0]?.email}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center" style={{ color: '#94a3b8', padding: '2rem' }}>
                        No volunteer hours logged this month yet
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button 
                    className="action-button approve-action"
                    onClick={() => setTab('approve')}
                  >
                    <span className="action-icon">✅</span>
                    <div>
                      <div className="action-title">Approve Hours</div>
                      <div className="action-subtitle">{stats.pendingHours || 0} pending</div>
                    </div>
                  </button>
                  <button 
                    className="action-button create-action"
                    onClick={() => setTab('create')}
                  >
                    <span className="action-icon">📅</span>
                    <div>
                      <div className="action-title">Create Event</div>
                      <div className="action-subtitle">Add new volunteer opportunity</div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Approve Hours Tab */}
      {tab === 'approve' && (
        <div className="dashboard-content">
          <div className="content-header">
            <h2 className="content-title">Pending Hours Approval</h2>
            <p className="content-subtitle">Review and approve volunteer hours</p>
          </div>
          
          {loading ? (
            <div className="loading-spinner">Loading pending hours...</div>
          ) : hours.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>All caught up!</h3>
              <p>No pending hours to approve at this time.</p>
            </div>
          ) : (
            <div className="hours-list">
              {hours.map((h) => (
                <div key={h._id} className="hour-approval-card">
                  <div className="hour-info">
                    <div className="volunteer-name">{h.user?.name || h.user?.email || 'Volunteer'}</div>
                    <div className="hour-details">
                      <span className="event-name">{h.event?.name || 'Unknown Event'}</span>
                      <span className="hour-amount">{h.hoursWorked} hours</span>
                    </div>
                    {h.startTime && (
                      <div className="hour-time">
                        {new Date(h.startTime).toLocaleDateString()} • {new Date(h.startTime).toLocaleTimeString()}
                        {h.endTime && ` - ${new Date(h.endTime).toLocaleTimeString()}`}
                      </div>
                    )}
                  </div>
                  <div className="hour-actions">
                    <button 
                      className="approve-btn" 
                      onClick={() => handleApprove(h._id, true)}
                    >
                      Approve
                    </button>
                    <button 
                      className="reject-btn" 
                      onClick={() => handleApprove(h._id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Event Tab */}
      {tab === 'create' && (
        <div className="dashboard-content">
          <div className="content-header">
            <h2 className="content-title">Create New Event</h2>
            <p className="content-subtitle">Add a new volunteer opportunity</p>
          </div>
          
          <div className="form-card">
            <form onSubmit={handleCreateEvent} className="event-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Event Name</label>
                  <input 
                    name="name" 
                    value={eventForm.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter event name" 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time</label>
                  <input 
                    name="date" 
                    value={eventForm.date} 
                    onChange={handleChange} 
                    required 
                    type="datetime-local" 
                    className="form-input" 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input 
                    name="location" 
                    value={eventForm.location} 
                    onChange={handleChange} 
                    placeholder="Enter location" 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity (Optional)</label>
                  <input 
                    name="capacity" 
                    value={eventForm.capacity} 
                    onChange={handleChange} 
                    type="number" 
                    min="0" 
                    placeholder="Max volunteers" 
                    className="form-input" 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  name="description" 
                  value={eventForm.description} 
                  onChange={handleChange} 
                  placeholder="Describe the volunteer opportunity..." 
                  className="form-textarea" 
                  rows={4} 
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="create-event-btn" 
                  disabled={creating}
                >
                  {creating ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {message && <div className="message-toast">{message}</div>}
    </div>
  );
}
