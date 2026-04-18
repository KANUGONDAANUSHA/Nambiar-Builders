import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

export default function EmailLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/email-logs");
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("LOAD EMAIL LOGS ERROR:", error);
      alert("Failed to load email logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClearLogs = async () => {
    const ok = window.confirm("Are you sure you want to delete all email logs?");
    if (!ok) return;

    try {
      await API.delete("/api/email-logs");
      alert("All email logs deleted successfully");
      await loadLogs();
    } catch (error) {
      console.error("DELETE EMAIL LOGS ERROR:", error);
      alert(error?.response?.data?.error || "Failed to delete email logs");
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const typeMatch = typeFilter === "all" ? true : log.type === typeFilter;
      const statusMatch =
        statusFilter === "all" ? true : log.status === statusFilter;

      return typeMatch && statusMatch;
    });
  }, [logs, typeFilter, statusFilter]);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Email Logs</h1>
          <p style={styles.subtitle}>
            Track sent and failed emails from the system.
          </p>
        </div>

        <div style={styles.headerButtons}>
          <button style={styles.secondaryButton} onClick={loadLogs}>
            Refresh
          </button>
          <button style={styles.dangerButton} onClick={handleClearLogs}>
            Clear Logs
          </button>
        </div>
      </div>

      <div style={styles.filtersRow}>
        <div style={styles.filterBox}>
          <label style={styles.label}>Filter by Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">All</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="welcome">Welcome</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div style={styles.filterBox}>
          <label style={styles.label}>Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">All</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Logs</span>
          <strong style={styles.statValue}>{logs.length}</strong>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Filtered Results</span>
          <strong style={styles.statValue}>{filteredLogs.length}</strong>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Error</th>
                <th style={styles.th}>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={styles.emptyCell}>
                    Loading email logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.emptyCell}>
                    No email logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} style={styles.tr}>
                    <td style={styles.td}>{log.email || "-"}</td>
                    <td style={styles.td}>{log.type || "-"}</td>
                    <td style={styles.td}>{log.subject || "-"}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(log.status === "sent"
                            ? styles.successBadge
                            : styles.failedBadge),
                        }}
                      >
                        {log.status || "-"}
                      </span>
                    </td>
                    <td style={styles.td}>{log.error || "-"}</td>
                    <td style={styles.td}>
                      {log.sentAt
                        ? new Date(log.sentAt).toLocaleString()
                        : "-"}
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
    fontFamily: "Inter, sans-serif",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "40px",
    fontWeight: "800",
    color: "#1f1a17",
  },
  subtitle: {
    margin: "8px 0 0 0",
    fontSize: "15px",
    color: "#6c6258",
  },
  headerButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  filtersRow: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  filterBox: {
    minWidth: "240px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#3d3126",
  },
  input: {
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #d9c8b4",
    outline: "none",
    padding: "0 14px",
    fontSize: "14px",
    background: "#fcfaf7",
  },
  statsRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  statBox: {
    minWidth: "180px",
    background: "#f9f4ee",
    border: "1px solid #eadfce",
    borderRadius: "16px",
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  statLabel: {
    fontSize: "13px",
    color: "#7b6b5a",
  },
  statValue: {
    fontSize: "24px",
    color: "#2f241b",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(44, 29, 12, 0.08)",
    border: "1px solid #eadfce",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "16px",
    border: "1px solid #eee3d6",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
    background: "#fff",
  },
  th: {
    textAlign: "left",
    padding: "16px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#6b5a4a",
    background: "#f8f3ed",
    borderBottom: "1px solid #eadfce",
  },
  tr: {
    borderBottom: "1px solid #f0e7dc",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#2f241b",
    verticalAlign: "top",
  },
  emptyCell: {
    padding: "30px",
    textAlign: "center",
    color: "#7b6f63",
    fontSize: "15px",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  successBadge: {
    background: "#e8f6ea",
    color: "#1f7a35",
  },
  failedBadge: {
    background: "#fdeaea",
    color: "#b42318",
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
    cursor: "pointer",
  },
  dangerButton: {
    height: "44px",
    border: "none",
    borderRadius: "12px",
    padding: "0 18px",
    background: "#c94f4f",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
};