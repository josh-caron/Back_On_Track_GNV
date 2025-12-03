// frontend/src/components/admin/ManualHoursForm.jsx
import { useEffect, useState } from "react";

const ManualHoursForm = () => {
  const [events, setEvents] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [eventId, setEventId] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [markApproved, setMarkApproved] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Adjust this if you store the token differently
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        setErrorMsg("");
        const res = await fetch("/api/events", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error(err);
        setErrorMsg("Could not load events for manual hours entry.");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!userEmail || !eventId || !hoursWorked) {
      setErrorMsg("Please fill in email, event, and hours.");
      return;
    }

    const body = {
      userEmail,
      eventId,
      hoursWorked: Number(hoursWorked),
      markApproved,
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/manual-hours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create manual hours entry");
      }

      setSuccessMsg("Manual hours entry created successfully.");
      setUserEmail("");
      setEventId("");
      setHoursWorked("");
      setMarkApproved(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong submitting the form.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border rounded-lg p-6 shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">
        Manually Enter Volunteer Hours
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Use this if a volunteer forgot to check in/out but did attend an event.
      </p>

      {errorMsg && (
        <div className="mb-4 rounded bg-red-100 text-red-800 px-3 py-2 text-sm">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded bg-green-100 text-green-800 px-3 py-2 text-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Volunteer Email
          </label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="volunteer@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Event
          </label>
          {loadingEvents ? (
            <p className="text-sm text-gray-500">Loading events...</p>
          ) : (
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              required
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name || event.title} –{" "}
                  {event.date
                    ? new Date(event.date).toLocaleString()
                    : "No date"}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Hours Worked
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={hoursWorked}
            onChange={(e) => setHoursWorked(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="e.g., 2.5"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="markApproved"
            type="checkbox"
            checked={markApproved}
            onChange={(e) => setMarkApproved(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="markApproved" className="text-sm">
            Mark these hours as already approved
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save Manual Hours"}
        </button>
      </form>
    </div>
  );
};

export default ManualHoursForm;
