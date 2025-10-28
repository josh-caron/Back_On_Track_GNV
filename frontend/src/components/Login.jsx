import { useState } from "react";

export default function Login({ setLoggedInUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:5050/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", data); // 🧪 ADD THIS RIGHT HERE

      if (res.ok) {
        setMessage("✅ Login successful!");
        // Store user info in App state
        setLoggedInUser(data); // assuming backend returns user info with role
        localStorage.setItem("token", data.token); // optional
      } else {
        setMessage(`❌ ${data.message || "Login failed"}`);
      }
    } catch (err) {
      setMessage("❌ Server error. Please try again later.");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        className="auth-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="auth-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="primary-button">
        Login
      </button>
      {message && <p className="auth-message">{message}</p>}
    </form>
  );
}
