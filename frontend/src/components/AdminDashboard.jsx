export default function AdminDashboard({ onLogout }) {
  return (
    <div className="admin-card">
      <h2 className="admin-title">Admin Dashboard</h2>
      <div className="admin-actions">
        <button>✅ Approve Volunteer Hours</button>
        <button>📅 Create Event</button>
        <button>📢 Post Announcements</button>
      </div>
      <button className="logout-button" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}
