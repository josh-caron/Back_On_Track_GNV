import { useState } from "react";

export default function Login({ setLoggedInUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Login successful! Redirecting...");
        // Store user info in App state
        setTimeout(() => {
          setLoggedInUser(data);
          localStorage.setItem("token", data.token);
        }, 1000);
      } else {
        setMessage(`❌ ${data.message || "Login failed"}`);
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
        <div className="auth-icon">👋</div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleLogin} className="auth-form-content">
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
              placeholder="Enter your password"
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
              Signing In...
            </>
          ) : (
            'Sign In'
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
