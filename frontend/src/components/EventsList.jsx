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
    <div style={{ flex: 1 }}>
      <h2 className="text-xl font-semibold mb-4">Events</h2>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul className="space-y-3 text-left">
          {events.map((ev) => {
            const isRegistered = registeredSet.has(ev._id);
            return (
              <li key={ev._id} className="p-3 rounded" style={{ backgroundColor: "#0f172a" }}>
                <div className="font-bold text-lg">{ev.name}</div>
                {ev.date && (
                  <div className="text-sm text-slate-300">{new Date(ev.date).toLocaleString()}</div>
                )}
                {ev.location && <div className="text-sm">Location: {ev.location}</div>}
                {ev.description && <div className="text-sm">{ev.description}</div>}
                {ev.capacity != null && <div className="text-xs mt-2">Capacity: {ev.capacity}</div>}

                <div className="mt-3">
                  {isRegistered ? (
                    <button className="primary-button" onClick={() => handleUnregister(ev._id)}>Unregister</button>
                  ) : (
                    <button className="primary-button" onClick={() => handleRegister(ev._id)}>Register</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {message && <p className="text-sm mt-3">{message}</p>}
    </div>
  );
}
