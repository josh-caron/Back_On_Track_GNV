// Register: Account creation form for new volunteers.
import { useState } from "react";

export default function Register({ setLoggedInUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Registration successful! Redirecting to homepage...");
        // Store user info and redirect to homepage after a brief delay
        setTimeout(() => {
          setLoggedInUser(data);
          localStorage.setItem("token", data.token);
        }, 1500);
      } else {
        setMessage(`❌ ${data.message || "Registration failed"}`);
      }
    } catch (err) {
      setMessage("❌ Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modern-auth-form">
      <div className="auth-header">
        <div className="auth-icon">🎉</div>
        <h2 className="auth-title">Join Our Community</h2>
        <p className="auth-subtitle">Create your account to start volunteering</p>
      </div>

      <form onSubmit={handleRegister} className="auth-form-content">
        <div className="form-field">
          <label className="field-label">Full Name</label>
          <div className="input-wrapper">
            <span className="input-icon">👤</span>
            <input
              type="text"
              placeholder="Enter your full name"
              className="modern-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label className="field-label">Email Address</label>
          <div className="input-wrapper">
            <span className="input-icon">📧</span>
            <input
              type="email"
              placeholder="Enter your email"
              className="modern-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label className="field-label">Password</label>
          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Create a secure password"
              className="modern-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          className={`modern-submit-btn ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        {message && (
          <div className={`auth-message-modern ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
