import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import "./index.css";

export default function App() {
  const [view, setView] = useState("login");
  const [loggedInUser, setLoggedInUser] = useState(null);

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

  // 👇 Otherwise, keep normal login/register flow
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
            <Register />
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
