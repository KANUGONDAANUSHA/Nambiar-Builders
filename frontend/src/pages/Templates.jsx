import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

const initialForm = {
  name: "",
  type: "",
  subject: "",
  htmlContent: ""
};

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/templates");
      setTemplates(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("LOAD TEMPLATES ERROR:", error);

      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load templates";

      alert(message);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
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

    if (
      !form.name.trim() ||
      !form.type.trim() ||
      !form.subject.trim() ||
      !form.htmlContent.trim()
    ) {
      alert("Name, type, subject and HTML content are required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        type: form.type.trim(),
        subject: form.subject.trim(),
        htmlContent: form.htmlContent.trim()
      };

      if (editingId) {
        await API.put(`/api/templates/${editingId}`, payload);
        alert("Template updated successfully");
      } else {
        await API.post("/api/templates", payload);
        alert("Template created successfully");
      }

      resetForm();
      await loadTemplates();
    } catch (error) {
      console.error("SAVE TEMPLATE ERROR:", error);

      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save template";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (template) => {
    setEditingId(template.id);
    setForm({
      name: template.name || "",
      type: template.type || "",
      subject: template.subject || "",
      htmlContent: template.htmlContent || ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this template?");
    if (!ok) return;

    try {
      await API.delete(`/api/templates/${id}`);
      alert("Template deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      await loadTemplates();
    } catch (error) {
      console.error("DELETE TEMPLATE ERROR:", error);

      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete template";

      alert(message);
    }
  };

  const filteredTemplates = useMemo(() => {
    const value = search.toLowerCase().trim();

    return templates.filter((template) => {
      return (
        (template.name || "").toLowerCase().includes(value) ||
        (template.type || "").toLowerCase().includes(value) ||
        (template.subject || "").toLowerCase().includes(value) ||
        (template.htmlContent || "").toLowerCase().includes(value)
      );
    });
  }, [templates, search]);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Templates</h1>
          <p style={styles.subtitle}>
            Create and manage email templates for birthday, anniversary,
            welcome, and event emails.
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                {editingId ? "Edit Template" : "Create Template"}
              </h2>
              <p style={styles.cardText}>
                {editingId
                  ? "Update the selected email template."
                  : "Create a new email template for your automated emails."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Template Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter template name"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Template Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Select type</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="welcome">Welcome</option>
                  <option value="event">Event</option>
                  <option value="festival">Festival</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div style={styles.inputGroupFull}>
                <label style={styles.label}>Email Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Enter email subject"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroupFull}>
                <label style={styles.label}>HTML Content</label>
                <textarea
                  name="htmlContent"
                  value={form.htmlContent}
                  onChange={handleChange}
                  placeholder="Enter HTML content with placeholders like {{name}}, {{department}}, {{designation}}"
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={styles.helpBox}>
              <strong>Available placeholders:</strong>{" "}
              {`{{name}}, {{email}}, {{employeeId}}, {{department}}, {{designation}}`}
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
                    ? "Update Template"
                    : "Create Template"}
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
            <h2 style={styles.cardTitle}>Template List</h2>
            <p style={styles.cardText}>
              Search, edit, and delete your saved email templates.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Total Templates</span>
            <strong style={styles.statValue}>{templates.length}</strong>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Showing Results</span>
            <strong style={styles.statValue}>{filteredTemplates.length}</strong>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>HTML Preview</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={styles.emptyCell}>
                    Loading templates...
                  </td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.emptyCell}>
                    No templates found
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template) => (
                  <tr key={template.id} style={styles.tr}>
                    <td style={styles.td}>{template.name || "-"}</td>
                    <td style={styles.td}>{template.type || "-"}</td>
                    <td style={styles.td}>{template.subject || "-"}</td>
                    <td style={styles.td}>
                      <div style={styles.previewBox}>
                        {template.htmlContent
                          ? template.htmlContent.slice(0, 100)
                          : "-"}
                        {template.htmlContent &&
                        template.htmlContent.length > 100
                          ? "..."
                          : ""}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          type="button"
                          style={styles.editButton}
                          onClick={() => handleEdit(template)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          style={styles.deleteButton}
                          onClick={() => handleDelete(template.id)}
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
    minHeight: "220px",
    borderRadius: "12px",
    border: "1px solid #d9c8b4",
    outline: "none",
    padding: "14px",
    fontSize: "14px",
    background: "#fcfaf7",
    resize: "vertical",
    fontFamily: "inherit"
  },
  helpBox: {
    marginTop: "16px",
    padding: "14px 16px",
    background: "#f9f4ee",
    border: "1px solid #eadfce",
    borderRadius: "12px",
    color: "#6b4727",
    fontSize: "14px"
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
    minWidth: "1100px",
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
    maxWidth: "320px",
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