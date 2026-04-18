import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

export default function EmailQueue() {
  const [data, setData] = useState({
    scheduled: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    total: 0,
    logs: []
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/email-logs");
      setData({
        scheduled: res.data?.scheduled || 0,
        sent: res.data?.sent || 0,
        delivered: res.data?.delivered || 0,
        failed: res.data?.failed || 0,
        total: res.data?.total || 0,
        logs: Array.isArray(res.data?.logs) ? res.data.logs : []
      });
    } catch (error) {
      console.error("LOAD EMAIL QUEUE ERROR:", error);
      setData({
        scheduled: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        total: 0,
        logs: []
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const value = search.toLowerCase();

    return data.logs.filter((log) => {
      return (
        (log.type || "").toLowerCase().includes(value) ||
        (log.recipient || "").toLowerCase().includes(value) ||
        (log.status || "").toLowerCase().includes(value) ||
        (log.subject || "").toLowerCase().includes(value) ||
        (log.message || "").toLowerCase().includes(value)
      );
    });
  }, [data.logs, search]);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Email Queue</h1>
          <p style={styles.subtitle}>Track email status and log history.</p>
        </div>

        <button style={styles.primaryButton} onClick={loadQueue}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={styles.card}>
          <p style={styles.emptyText}>Loading email queue...</p>
        </div>
      ) : (
        <>
          <div style={styles.statsGrid}>
            <StatCard title="Scheduled" value={data.scheduled} />
            <StatCard title="Sent" value={data.sent} />
            <StatCard title="Delivered" value={data.delivered} />
            <StatCard title="Failed" value={data.failed} />
            <StatCard title="Total Logs" value={data.total} />
          </div>

          <div style={styles.card}>
            <div style={styles.tableHeader}>
              <div>
                <h2 style={styles.cardTitle}>Email Logs</h2>
                <p style={styles.cardText}>
                  View the latest sent, failed, and delivered emails.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Recipient</th>
                    <th style={styles.th}>Subject</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Message</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.emptyCell}>
                        No email logs found
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} style={styles.tr}>
                        <td style={styles.td}>{log.type || "-"}</td>
                        <td style={styles.td}>{log.recipient || "-"}</td>
                        <td style={styles.td}>{log.subject || "-"}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...(log.status === "sent"
                                ? styles.sentBadge
                                : log.status === "failed"
                                ? styles.failedBadge
                                : log.status === "delivered"
                                ? styles.deliveredBadge
                                : styles.scheduledBadge)
                            }}
                          >
                            {log.status || "-"}
                          </span>
                        </td>
                        <td style={styles.td}>{log.message || "-"}</td>
                        <td style={styles.td}>
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={styles.statCard}>
      <h3 style={styles.statTitle}>{title}</h3>
      <p style={styles.statValue}>{value}</p>
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
    gap: "16px",
    flexWrap: "wrap",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  statCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 10px 30px rgba(44, 29, 12, 0.08)",
    border: "1px solid #eadfce"
  },
  statTitle: {
    margin: 0,
    marginBottom: "10px",
    color: "#6c6258",
    fontSize: "14px",
    fontWeight: "600"
  },
  statValue: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
    color: "#8b5e3c"
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(44, 29, 12, 0.08)",
    border: "1px solid #eadfce"
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
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px",
    flexWrap: "wrap"
  },
  searchInput: {
    width: "320px",
    maxWidth: "100%",
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #d9c8b4",
    outline: "none",
    padding: "0 14px",
    fontSize: "14px",
    background: "#fcfaf7"
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
  statusBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize"
  },
  sentBadge: {
    background: "#edf7ed",
    color: "#2e6b3a",
    border: "1px solid #b7d8bc"
  },
  failedBadge: {
    background: "#fdecec",
    color: "#b42318",
    border: "1px solid #f5b5b5"
  },
  deliveredBadge: {
    background: "#eef6ff",
    color: "#175cd3",
    border: "1px solid #bfd4ff"
  },
  scheduledBadge: {
    background: "#f9f4ee",
    color: "#8b5e34",
    border: "1px solid #eadfce"
  },
  emptyText: {
    margin: 0,
    color: "#6c6258",
    fontSize: "14px"
  },
  emptyCell: {
    padding: "30px",
    textAlign: "center",
    color: "#7b6f63",
    fontSize: "15px"
  }
};