import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

const initialForm = {
  title: "",
  date: "",
  description: ""
};

function formatDateForInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function formatDateForDisplay(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/events");
      setEvents(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("LOAD EVENTS ERROR:", error);
      alert(error?.response?.data?.error || error?.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.date) {
      alert("Event title and date are required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        date: form.date,
        description: form.description.trim()
      };

      if (editingId) {
        await API.put(`/api/events/${editingId}`, payload);
        alert("Event updated successfully");
      } else {
        await API.post("/api/events", payload);
        alert("Event created successfully");
      }

      resetForm();
      await loadEvents();
    } catch (error) {
      console.error("SAVE EVENT ERROR:", error);
      alert(error?.response?.data?.error || error?.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setForm({
      title: event.title || "",
      date: formatDateForInput(event.date),
      description: event.description || ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this event?");
    if (!ok) return;

    try {
      await API.delete(`/api/events/${id}`);
      alert("Event deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      await loadEvents();
    } catch (error) {
      console.error("DELETE EVENT ERROR:", error);
      alert(error?.response?.data?.error || error?.message || "Failed to delete event");
    }
  };

  const filteredEvents = useMemo(() => {
    const value = search.toLowerCase().trim();

    return events.filter((event) => {
      return (
        (event.title || "").toLowerCase().includes(value) ||
        (event.description || "").toLowerCase().includes(value) ||
        formatDateForDisplay(event.date).toLowerCase().includes(value)
      );
    });
  }, [events, search]);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Events</h1>
          <p style={styles.subtitle}>
            Create and manage festival, holiday, and special event schedules.
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                {editingId ? "Edit Event" : "Create Event"}
              </h2>
              <p style={styles.cardText}>
                {editingId
                  ? "Update the selected event details."
                  : "Add a new event for scheduling emails."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Event Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Event Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroupFull}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter event description"
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="submit"
                style={{
                  ...styles.primaryButton,
                  ...(saving ? styles.disabledButton : {})
                }}
                disabled={saving}
              >
                {saving
                  ? editingId
                    ? "Updating..."
                    : "Saving..."
                  : editingId
                    ? "Update Event"
                    : "Create Event"}
              </button>

              {editingId && (
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.cardTitle}>Event List</h2>
            <p style={styles.cardText}>
              Search, edit, and delete saved events.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Total Events</span>
            <strong style={styles.statValue}>{events.length}</strong>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Showing Results</span>
            <strong style={styles.statValue}>{filteredEvents.length}</strong>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={styles.emptyCell}>
                    Loading events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="4" style={styles.emptyCell}>
                    No events found
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} style={styles.tr}>
                    <td style={styles.td}>{event.title || "-"}</td>
                    <td style={styles.td}>{formatDateForDisplay(event.date)}</td>
                    <td style={styles.td}>
                      <div style={styles.previewBox}>
                        {event.description || "-"}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          type="button"
                          style={styles.editButton}
                          onClick={() => handleEdit(event)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          style={styles.deleteButton}
                          onClick={() => handleDelete(event.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    fontFamily: "Inter, sans-serif"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  title: {
    margin: 0,
    fontSize: "40px",
    fontWeight: "800",
    color: "#1f1a17"
  },
  subtitle: {
    margin: "8px 0 0 0",
    fontSize: "15px",
    color: "#6c6258"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
    marginBottom: "20px"
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(44, 29, 12, 0.08)",
    border: "1px solid #eadfce",
    marginBottom: "20px"
  },
  cardHeader: {
    marginBottom: "18px"
  },
  cardTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#241c15"
  },
  cardText: {
    margin: "6px 0 0 0",
    color: "#7d7367",
    fontSize: "14px"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  inputGroupFull: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    gridColumn: "1 / -1"
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#3d3126"
  },
  input: {
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #d9c8b4",
    outline: "none",
    padding: "0 14px",
    fontSize: "14px",
    background: "#fcfaf7"
  },
  textarea: {
    minHeight: "160px",
    borderRadius: "12px",
    border: "1px solid #d9c8b4",
    outline: "none",
    padding: "14px",
    fontSize: "14px",
    background: "#fcfaf7",
    resize: "vertical",
    fontFamily: "inherit"
  },
  buttonRow: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-start",
    gap: "12px",
    flexWrap: "wrap"
  },
  primaryButton: {
    height: "44px",
    border: "none",
    borderRadius: "12px",
    padding: "0 18px",
    background: "#8b5e34",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer"
  },
  disabledButton: {
    opacity: 0.7,
    cursor: "not-allowed"
  },
  secondaryButton: {
    height: "44px",
    borderRadius: "12px",
    padding: "0 18px",
    background: "#f5ede4",
    color: "#6b4727",
    border: "1px solid #dbc4aa",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer"
  },
  editButton: {
    height: "36px",
    border: "none",
    borderRadius: "10px",
    padding: "0 14px",
    background: "#8b5e34",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer"
  },
  deleteButton: {
    height: "36px",
    border: "none",
    borderRadius: "10px",
    padding: "0 14px",
    background: "#c94f4f",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer"
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px",
    flexWrap: "wrap"
  },
  searchInput: {
    width: "300px",
    maxWidth: "100%",
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #d9c8b4",
    outline: "none",
    padding: "0 14px",
    fontSize: "14px",
    background: "#fcfaf7"
  },
  statsRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "18px",
    flexWrap: "wrap"
  },
  statBox: {
    minWidth: "180px",
    background: "#f9f4ee",
    border: "1px solid #eadfce",
    borderRadius: "16px",
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  statLabel: {
    fontSize: "13px",
    color: "#7b6b5a"
  },
  statValue: {
    fontSize: "24px",
    color: "#2f241b"
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "16px",
    border: "1px solid #eee3d6"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
    background: "#fff"
  },
  th: {
    textAlign: "left",
    padding: "16px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#6b5a4a",
    background: "#f8f3ed",
    borderBottom: "1px solid #eadfce"
  },
  tr: {
    borderBottom: "1px solid #f0e7dc"
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#2f241b",
    verticalAlign: "top"
  },
  previewBox: {
    maxWidth: "380px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#5d5247"
  },
  emptyCell: {
    padding: "30px",
    textAlign: "center",
    color: "#7b6f63",
    fontSize: "15px"
  }
};