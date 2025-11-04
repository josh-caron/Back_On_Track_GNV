import { useEffect, useState } from "react";

export default function MyHours() {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchMyHours = async () => {
    if (!token) {
      setMessage('Please log in to view your hours');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/hours/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setHours(data);
      } else {
        const errorData = await res.json();
        setMessage(`❌ Error loading hours: ${errorData.message || res.status}`);
      }
    } catch (err) {
      setMessage("❌ Unable to load hours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate total hours and separate approved/pending
  const approvedHours = hours.filter(h => h.approved && h.hoursWorked);
  const pendingHours = hours.filter(h => !h.approved && h.hoursWorked);
  const totalApprovedHours = approvedHours.reduce((sum, h) => sum + (h.hoursWorked || 0), 0);
  const totalPendingHours = pendingHours.reduce((sum, h) => sum + (h.hoursWorked || 0), 0);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center">Loading your hours...</div>;
  }

  return (
    <div className="my-hours-container">
      <h2 className="section-title">My Volunteer Hours</h2>
      
      {message && <p className="auth-message">{message}</p>}
      
      {/* Summary Stats */}
      <div className="hours-summary">
        <div className="hours-stat">
          <div className="stat-number">{totalApprovedHours.toFixed(1)}</div>
          <div className="stat-label">Approved Hours</div>
        </div>
        <div className="hours-stat">
          <div className="stat-number">{totalPendingHours.toFixed(1)}</div>
          <div className="stat-label">Pending Approval</div>
        </div>
        <div className="hours-stat">
          <div className="stat-number">{(totalApprovedHours + totalPendingHours).toFixed(1)}</div>
          <div className="stat-label">Total Hours</div>
        </div>
      </div>

      {hours.length === 0 ? (
        <div className="no-hours">
          <p>You haven't logged any volunteer hours yet.</p>
          <p>Check in to events from the "My Registrations" tab to start tracking your hours!</p>
        </div>
      ) : (
        <div className="hours-list">
          <h3 className="subsection-title">Hours History</h3>
          
          {/* Approved Hours */}
          {approvedHours.length > 0 && (
            <div className="hours-section">
              <h4 className="hours-section-title">✅ Approved Hours</h4>
              {approvedHours.map((hour) => (
                <div key={hour._id} className="hour-item approved">
                  <div className="hour-main">
                    <div className="hour-event">{hour.event?.name || 'Unknown Event'}</div>
                    <div className="hour-time">{hour.hoursWorked} hours</div>
                  </div>
                  <div className="hour-details">
                    <div>📅 {formatDate(hour.startTime || hour.createdAt)}</div>
                    {hour.startTime && hour.endTime && (
                      <div>🕒 {formatTime(hour.startTime)} - {formatTime(hour.endTime)}</div>
                    )}
                    <div>📍 {hour.event?.location || 'Location not specified'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending Hours */}
          {pendingHours.length > 0 && (
            <div className="hours-section">
              <h4 className="hours-section-title">⏳ Pending Approval</h4>
              {pendingHours.map((hour) => (
                <div key={hour._id} className="hour-item pending">
                  <div className="hour-main">
                    <div className="hour-event">{hour.event?.name || 'Unknown Event'}</div>
                    <div className="hour-time">{hour.hoursWorked} hours</div>
                  </div>
                  <div className="hour-details">
                    <div>📅 {formatDate(hour.startTime || hour.createdAt)}</div>
                    {hour.startTime && hour.endTime && (
                      <div>🕒 {formatTime(hour.startTime)} - {formatTime(hour.endTime)}</div>
                    )}
                    <div>📍 {hour.event?.location || 'Location not specified'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Open Sessions */}
          {hours.some(h => h.status === 'open') && (
            <div className="hours-section">
              <h4 className="hours-section-title">🔴 Active Check-ins</h4>
              {hours.filter(h => h.status === 'open').map((hour) => (
                <div key={hour._id} className="hour-item active">
                  <div className="hour-main">
                    <div className="hour-event">{hour.event?.name || 'Unknown Event'}</div>
                    <div className="hour-time">Currently checked in</div>
                  </div>
                  <div className="hour-details">
                    <div>📅 {formatDate(hour.startTime)}</div>
                    <div>🕒 Started at {formatTime(hour.startTime)}</div>
                    <div>📍 {hour.event?.location || 'Location not specified'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}