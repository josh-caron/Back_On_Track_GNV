import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import EventsList from "./components/EventsList";
import MyRegistrations from "./components/MyRegistrations";
import MyHours from "./components/MyHours";
import AdminDashboard from "./components/AdminDashboard";
import "./index.css";

export default function App() {
  const [view, setView] = useState("login");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [tab, setTab] = useState("browse");

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("token");
    setView("login");
  };

  // ✅ If user is admin, show admin dashboard and hide login card
  if (loggedInUser?.role === "admin") {
    return (
      <div className="app-container">
        <h1 className="app-title">Back On Track GNV</h1>
        <AdminDashboard onLogout={handleLogout} />
      </div>
    );
  }

  // If a volunteer (authenticated non-admin) is logged in, show events list
  if (loggedInUser) {
    return (
      <div className="app-container">
        <h1 className="app-title">Back On Track GNV</h1>
        <div className="auth-card" style={{ maxWidth: 1200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>Welcome, <strong>{loggedInUser.name || loggedInUser.email}</strong></div>
            <div>
              <button className="switch-button" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <button className={`switch-button ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>Browse Events</button>
            <button className={`switch-button ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')} style={{ marginLeft: 8 }}>My Registrations</button>
            <button className={`switch-button ${tab === 'hours' ? 'active' : ''}`} onClick={() => setTab('hours')} style={{ marginLeft: 8 }}>My Hours</button>
          </div>

          <div>
            {tab === 'browse' ? <EventsList /> : 
             tab === 'my' ? <MyRegistrations /> : 
             <MyHours />}
          </div>
        </div>
      </div>
    );
  }

  // 👇 Otherwise, keep normal login/register flow for unauthenticated users
  return (
    <div className="app-container">
      <h1 className="app-title">Back On Track GNV</h1>
      <div className="auth-card">
        {view === "login" ? (
          <>
            <Login setLoggedInUser={setLoggedInUser} />
            <button
              className="switch-button"
              onClick={() => setView("register")}
            >
              Create an Account
            </button>
          </>
        ) : (
          <>
            <Register setLoggedInUser={setLoggedInUser} />
            <button
              className="switch-button"
              onClick={() => setView("login")}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
