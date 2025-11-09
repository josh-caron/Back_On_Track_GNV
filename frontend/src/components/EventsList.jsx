import { useEffect, useState } from "react";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [registeredSet, setRegisteredSet] = useState(new Set());

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (res.ok) setEvents(data);
      else setMessage(`❌ Error loading events: ${data.message || res.status}`);
    } catch (err) {
      setMessage("❌ Unable to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/registrations/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const ids = new Set(data.map((r) => (r.event && r.event._id) || r.event));
      setRegisteredSet(ids);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegister = async (eventId) => {
    if (!token) { setMessage('Please log in to register'); return; }
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok || res.status === 200 || res.status === 201) {
        // refresh registrations and events
        await fetchMyRegistrations();
        await fetchEvents();
        setMessage('Registered successfully');
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      setMessage('Server error registering');
    }
  };

  const handleUnregister = async (eventId) => {
    if (!token) { setMessage('Please log in'); return; }
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        await fetchMyRegistrations();
        await fetchEvents();
        setMessage('Unregistered');
      } else {
        setMessage(data.message || 'Unregister failed');
      }
    } catch (err) {
      setMessage('Server error unregistering');
    }
  };

  return (
    <div className="volunteer-content">
      <div className="content-header">
        <h2 className="content-title">Available Events</h2>
        <p className="content-subtitle">Discover volunteer opportunities in your community</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No Events Available</h3>
          <p>Check back soon for new volunteer opportunities!</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((ev) => {
            const isRegistered = registeredSet.has(ev._id);
            const eventDate = ev.date ? new Date(ev.date) : null;
            const isPastEvent = eventDate && eventDate < new Date();
            
            return (
              <div key={ev._id} className={`event-card ${isRegistered ? 'registered' : ''} ${isPastEvent ? 'past-event' : ''}`}>
                <div className="event-header">
                  <h3 className="event-title">{ev.name}</h3>
                  {isRegistered && <span className="registered-badge">✅ Registered</span>}
                </div>

                <div className="event-details">
                  {eventDate && (
                    <div className="event-detail">
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
                    <div className="event-detail">
                      <span className="detail-icon">🕒</span>
                      <span className="detail-text">
                        {eventDate.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  )}

                  {ev.location && (
                    <div className="event-detail">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{ev.location}</span>
                    </div>
                  )}

                  {ev.capacity != null && (
                    <div className="event-detail">
                      <span className="detail-icon">👥</span>
                      <span className="detail-text">Max {ev.capacity} volunteers</span>
                    </div>
                  )}
                </div>

                {ev.description && (
                  <div className="event-description">
                    {ev.description}
                  </div>
                )}

                <div className="event-actions">
                  {isPastEvent ? (
                    <button className="event-btn disabled" disabled>
                      Event Ended
                    </button>
                  ) : isRegistered ? (
                    <button 
                      className="event-btn unregister" 
                      onClick={() => handleUnregister(ev._id)}
                    >
                      Unregister
                    </button>
                  ) : (
                    <button 
                      className="event-btn register" 
                      onClick={() => handleRegister(ev._id)}
                    >
                      Register Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {message && (
        <div className={`message-toast ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
