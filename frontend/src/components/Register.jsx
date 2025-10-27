import { useState } from "react";

export default function Register({ onNavigate }) {
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
        setMessage("✅ Registration successful!");
      } else {
        setMessage(`❌ Error: ${data.message || "Something went wrong"}`);
      }
    } catch (err) {
      setMessage("❌ Server error. Please try again later.");
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
      style={{
        backgroundColor: "#334155",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-3 shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none"
        style={{
          backgroundColor: "#475569",
          color: "white",
          borderColor: "#64748B",
          width: "100%",
        }}
      />
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
          width: "100%",
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
          width: "100%",
        }}
      />

      <div style={{ width: "100%", display: 'flex', gap: 8 }}>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none w-full"
        >
          Register
        </button>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate("login")}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none w-full"
        >
          Login
        </button>
      </div>

      {message && <p className="text-center text-lg font-medium">{message}</p>}
    </form>
  );
}
