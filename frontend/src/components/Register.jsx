import { useState } from "react";

export default function Register({ setLoggedInUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

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
    }
  };

  return (
    <form className="auth-form" onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Name"
        className="auth-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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
        Register
      </button>
      {message && <p className="auth-message">{message}</p>}
    </form>
  );
}
