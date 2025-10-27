import { useState } from "react";

function App() {
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

  // Events list / DB-driven UI
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (res.ok) setEvents(data);
      else setMessage(`❌ Error loading events: ${data.message || res.status}`);
    } catch (err) {
      setMessage('❌ Unable to load events');
    } finally {
      setLoadingEvents(false);
    }
  };

  // Load events on mount
  useState(() => {
    fetchEvents();
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundColor: "#1E293B", // Soft dark blue
        color: "white", // White text
        fontFamily: "'Poppins', sans-serif", // New font
        textAlign: "center", // Center text
      }}
    >
      <h1 className="text-3xl font-bold mb-6">Back On Track GNV</h1>
      
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
        style={{
          backgroundColor: "#334155", // Slightly lighter dark blue for the form
          color: "white",
          display: "flex",
          flexDirection: "column", // Stack input boxes
          alignItems: "center", // Center content
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
            backgroundColor: "#475569", // Input background
            color: "white",
            borderColor: "#64748B", // Border color
            width: "15%", // Reduced width
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
            width: "15%", // Reduced width
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
            width: "15%", // Reduced width
          }}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none w-full"
        >
          Register
        </button>
      </form>

      {message && (
        <p className="text-center text-lg font-medium">{message}</p>
      )}
    </div>
  );
}

export default App;