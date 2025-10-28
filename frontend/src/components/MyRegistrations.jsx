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

  if (loading) return <p>Loading your registrations...</p>;

  if (regs.length === 0) return <p>You have no registrations yet.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">My Registrations</h3>
      <ul className="space-y-3 text-left">
        {regs.map((r) => (
          <li key={r._id} className="p-3 rounded" style={{ backgroundColor: '#0f172a' }}>
            <div className="font-bold">{r.event?.name || 'Event'}</div>
            {r.event?.date && <div className="text-sm">{new Date(r.event.date).toLocaleString()}</div>}
            {r.event?.location && <div className="text-sm">Location: {r.event.location}</div>}
            <div className="mt-2">
              {hasOpenSession(r.event?._id) ? (
                <button className="primary-button" onClick={() => handleCheckOut(r.event._id)}>Check out</button>
              ) : (
                <button className="primary-button" onClick={() => handleCheckIn(r.event._id)}>Check in</button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {message && <p className="text-sm mt-3">{message}</p>}
    </div>
  );
}
