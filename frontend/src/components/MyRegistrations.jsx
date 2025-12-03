// MyRegistrations: Manage registrations with event check-in/out.
import { useEffect, useState } from "react";

export default function MyRegistrations() {
  const [regs, setRegs] = useState([]);
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchRegs = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/registrations/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setRegs(data);
    } catch (err) {
      // ignore
    }
  };

  const fetchHours = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/hours/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setHours(data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchRegs(), fetchHours()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasOpenSession = (eventId) => {
    if (!eventId) return false;
    return hours.find((h) => h.event && h.event._id === eventId && h.status === 'open');
  };

  const handleCheckIn = async (eventId) => {
    if (!token) { setMessage('Please login'); return; }
    try {
      const res = await fetch('/api/hours/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event: eventId })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Checked in');
        await fetchHours();
      } else setMessage(data.message || 'Check-in failed');
    } catch (err) { setMessage('Server error'); }
  };

  const handleCheckOut = async (eventId) => {
    if (!token) { setMessage('Please login'); return; }
    try {
      const res = await fetch('/api/hours/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event: eventId })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Checked out');
        await fetchHours();
      } else setMessage(data.message || 'Check-out failed');
    } catch (err) { setMessage('Server error'); }
  };

  return (
    <div className="volunteer-content">
      <div className="content-header">
        <h2 className="content-title">My Registrations</h2>
        <p className="content-subtitle">Manage your registered volunteer events</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading your registrations...</div>
      ) : regs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Registrations Yet</h3>
          <p>Browse events to sign up for volunteer opportunities!</p>
        </div>
      ) : (
        <div className="registrations-grid">
          {regs.map((r) => {
            // Skip registrations with missing event data
            if (!r.event || !r.event._id) {
              return null;
            }
            
            const eventDate = r.event?.date ? new Date(r.event.date) : null;
            const isCheckedIn = hasOpenSession(r.event?._id);
            const isPastEvent = eventDate && eventDate < new Date();
            
            return (
              <div key={r._id} className={`registration-card ${isCheckedIn ? 'checked-in' : ''}`}>
                <div className="registration-header">
                  <h3 className="registration-title">{r.event?.name || 'Event'}</h3>
                  {isCheckedIn && <span className="status-badge active">🔴 Checked In</span>}
                </div>

                <div className="registration-details">
                  {eventDate && (
                    <div className="registration-detail">
                      <span className="detail-icon">📅</span>
                      <span className="detail-text">
                        {eventDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  )}

                  {eventDate && (
                    <div className="registration-detail">
                      <span className="detail-icon">🕒</span>
                      <span className="detail-text">
                        {eventDate.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  )}

                  {r.event?.location && (
                    <div className="registration-detail">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{r.event.location}</span>
                    </div>
                  )}

                  <div className="registration-detail">
                    <span className="detail-icon">✅</span>
                    <span className="detail-text">
                      Registered {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="registration-actions">
                  {isPastEvent ? (
                    <button className="registration-btn disabled" disabled>
                      Event Completed
                    </button>
                  ) : isCheckedIn ? (
                    <button 
                      className="registration-btn checkout" 
                      onClick={() => handleCheckOut(r.event._id)}
                    >
                      Check Out
                    </button>
                  ) : (
                    <button 
                      className="registration-btn checkin" 
                      onClick={() => handleCheckIn(r.event._id)}
                    >
                      Check In
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {message && (
        <div className={`message-toast ${message.includes('✅') || message.includes('Checked') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
