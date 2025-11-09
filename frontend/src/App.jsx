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
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // If a volunteer (authenticated non-admin) is logged in, show volunteer dashboard
  if (loggedInUser) {
    return (
      <div className="volunteer-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <h1 className="dashboard-title">Volunteer Portal</h1>
            <p className="dashboard-subtitle">Welcome back, {loggedInUser.name || loggedInUser.email}!</p>
          </div>
          <div className="dashboard-header-right">
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-nav">
          <button 
            className={`nav-tab ${tab === 'browse' ? 'active' : ''}`} 
            onClick={() => setTab('browse')}
          >
            🎯 Browse Events
          </button>
          <button 
            className={`nav-tab ${tab === 'my' ? 'active' : ''}`} 
            onClick={() => setTab('my')}
          >
            📋 My Registrations
          </button>
          <button 
            className={`nav-tab ${tab === 'hours' ? 'active' : ''}`} 
            onClick={() => setTab('hours')}
          >
            ⏰ My Hours
          </button>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {tab === 'browse' ? <EventsList /> : 
           tab === 'my' ? <MyRegistrations /> : 
           <MyHours />}
        </div>
      </div>
    );
  }

  // 👇 Otherwise, keep normal login/register flow for unauthenticated users
  return (
    <div className="modern-auth-container">
      <div className="auth-background">
        <div className="auth-background-shapes">
          <div className="bg-shape shape-1"></div>
          <div className="bg-shape shape-2"></div>
          <div className="bg-shape shape-3"></div>
        </div>
      </div>
      
      <div className="auth-content">
        <div className="auth-brand">
          <div className="brand-logo">🌟</div>
          <h1 className="brand-title">Back On Track GNV</h1>
          <p className="brand-subtitle">Empowering our community through volunteer service</p>
        </div>

        <div className="auth-card-modern">
          {view === "login" ? (
            <>
              <Login setLoggedInUser={setLoggedInUser} />
              <div className="auth-switch">
                <p className="switch-text">Don't have an account?</p>
                <button
                  className="switch-link"
                  onClick={() => setView("register")}
                >
                  Create Account
                </button>
              </div>
            </>
          ) : (
            <>
              <Register setLoggedInUser={setLoggedInUser} />
              <div className="auth-switch">
                <p className="switch-text">Already have an account?</p>
                <button
                  className="switch-link"
                  onClick={() => setView("login")}
                >
                  Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
