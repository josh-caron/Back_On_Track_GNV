import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import "./index.css"; // 👈 import the stylesheet

export default function App() {
  const [view, setView] = useState("login");

  return (
    <div className="app-container">
      <h1 className="app-title">Back On Track GNV</h1>

      <div className="auth-card">
        {view === "login" ? (
          <>
            <Login />
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
