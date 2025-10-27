import { useState } from "react";

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        // store token for later use (simple client-side storage)
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        setMessage("✅ Login successful!");
      } else {
        setMessage(`❌ Error: ${data.message || "Login failed"}`);
      }
    } catch (err) {
      setMessage("❌ Server error. Please try again later.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundColor: "#1E293B",
        color: "white",
        fontFamily: "'Poppins', sans-serif",
        textAlign: "center",
      }}
    >
      <h1 className="text-3xl font-bold mb-6">Back On Track GNV</h1>
      
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
        style={{
          backgroundColor: "#334155",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 className="text-xl font-semibold mb-4">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none"
          style={{
            backgroundColor: "#475569",
            color: "white",
            borderColor: "#64748B",
            width: "70%",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none"
          style={{
            backgroundColor: "#475569",
            color: "white",
            borderColor: "#64748B",
            width: "70%",
          }}
        />

        <div style={{ width: "70%", display: "flex", gap: 8 }}>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none w-full"
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("register")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none w-full"
          >
            Register
          </button>
        </div>
      </form>

      {message && <p className="text-center text-lg font-medium">{message}</p>}
    </div>
  );
}
