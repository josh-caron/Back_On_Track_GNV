import { useEffect, useState } from "react";

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("approve");
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [creating, setCreating] = useState(false);
  const [eventForm, setEventForm] = useState({ name: "", date: "", capacity: "", location: "", description: "" });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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
    if (tab === 'approve') fetchPendingHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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
    <div className="admin-card">
      <h2 className="admin-title">Admin Dashboard</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={`switch-button ${tab === 'approve' ? 'active' : ''}`} onClick={() => setTab('approve')}>✅ Approve Hours</button>
        <button className={`switch-button ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>📅 Create Event</button>
      </div>

      {tab === 'approve' && (
        <div>
          {loading ? (
            <p>Loading pending hours...</p>
          ) : hours.length === 0 ? (
            <p>No pending hours.</p>
          ) : (
            <ul className="space-y-3 text-left">
              {hours.map((h) => (
                <li key={h._id} className="p-3 rounded" style={{ backgroundColor: '#0f172a' }}>
                  <div className="font-bold">{h.user?.name || h.user?.email || 'Volunteer'}</div>
                  <div className="text-sm">Event: {h.event?.name || h.event}</div>
                  <div className="text-sm">Hours: {h.hoursWorked ?? '—'}</div>
                  {h.startTime && <div className="text-sm">Start: {new Date(h.startTime).toLocaleString()}</div>}
                  {h.endTime && <div className="text-sm">End: {new Date(h.endTime).toLocaleString()}</div>}
                  <div style={{ marginTop: 8 }}>
                    <button className="primary-button" onClick={() => handleApprove(h._id, true)}>Approve</button>
                    <button className="switch-button" onClick={() => handleApprove(h._id, false)} style={{ marginLeft: 8 }}>Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'create' && (
        <div>
          <form onSubmit={handleCreateEvent} className="space-y-3">
            <input name="name" value={eventForm.name} onChange={handleChange} required placeholder="Event name" className="auth-input" />
            <input name="date" value={eventForm.date} onChange={handleChange} required type="datetime-local" className="auth-input" />
            <input name="capacity" value={eventForm.capacity} onChange={handleChange} type="number" min="0" placeholder="Capacity (optional)" className="auth-input" />
            <input name="location" value={eventForm.location} onChange={handleChange} placeholder="Location (optional)" className="auth-input" />
            <textarea name="description" value={eventForm.description} onChange={handleChange} placeholder="Description (optional)" className="auth-input" rows={4} />
            <div>
              <button type="submit" className="primary-button" disabled={creating}>{creating ? 'Creating...' : 'Create Event'}</button>
            </div>
          </form>
        </div>
      )}

      {message && <p className="auth-message">{message}</p>}

      <div style={{ marginTop: 12 }}>
        <button className="logout-button" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
