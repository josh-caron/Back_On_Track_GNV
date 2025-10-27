import { useState } from "react";
import Login from "./Login";
import Register from "./components/Register";
import EventsList from "./components/EventsList";

function App() {
  // view: "register" | "login"
  const [view, setView] = useState("register");

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

  // events are fetched inside EventsList component

  if (view === "login") {
    return <Login onNavigate={(v) => setView(v)} />;
  }

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

      <div style={{ width: "100%", maxWidth: 900, display: 'flex', gap: 24 }}>
        <div style={{ flex: 1, maxWidth: 380 }}>
          <Register onNavigate={(v) => setView(v)} />
        </div>

        <EventsList />
      </div>

      {message && (
        <p className="text-center text-lg font-medium">{message}</p>
      )}
    </div>
  );
}

export default App;