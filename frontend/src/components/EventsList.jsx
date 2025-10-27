import { useEffect, useState } from "react";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div style={{ flex: 1 }}>
      <h2 className="text-xl font-semibold mb-4">Events</h2>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul className="space-y-3 text-left">
          {events.map((ev) => (
            <li key={ev._id} className="p-3 rounded" style={{ backgroundColor: "#0f172a" }}>
              <div className="font-bold">{ev.title}</div>
              <div className="text-sm">{ev.description}</div>
              {ev.capacity != null && <div className="text-xs">Capacity: {ev.capacity}</div>}
            </li>
          ))}
        </ul>
      )}

      {message && <p className="text-sm mt-3">{message}</p>}
    </div>
  );
}
