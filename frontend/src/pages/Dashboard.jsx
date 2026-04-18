import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

function isSameMonthDay(dateValue, today) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isInThisWeek(dateValue, today) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  const startOfWeek = new Date(today);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const currentYearDate = new Date(
    today.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return currentYearDate >= startOfWeek && currentYearDate <= endOfWeek;
}

function isInThisMonth(dateValue, today) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  return date.getMonth() === today.getMonth();
}

function isUpcomingEvent(dateValue) {
  if (!dateValue) return false;

  const today = new Date();
  const eventDate = new Date(dateValue);

  if (Number.isNaN(eventDate.getTime())) return false;

  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  return eventDate >= start && eventDate <= end;
}

export default function Dashboard() {
  const user = { role: "admin" };

  const [employees, setEmployees] = useState([]);
  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayBirthdays: 0,
    weekBirthdays: 0,
    monthBirthdays: 0,
    todayAnniversaries: 0,
    weekAnniversaries: 0,
    monthAnniversaries: 0,
    totalTemplates: 0,
    totalEmailLogs: 0,
    todayEvents: 0,
    todayWishes: 0,
    thisWeekWishes: 0,
    thisMonthWishes: 0
  });

  const [status, setStatus] = useState("Loading dashboard...");
  const [loading, setLoading] = useState(true);
  const [welcomeStatus, setWelcomeStatus] = useState("");
  const [sendingWelcome, setSendingWelcome] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setStatus("Loading dashboard...");
      setWelcomeStatus("");

      const results = await Promise.allSettled([
        API.get("/api/employees"),
        API.get("/api/events"),
        API.get("/api/templates"),
        API.get("/api/dashboard"),
        API.get("/api/email-logs")
      ]);

      const empRes = results[0];
      const eventRes = results[1];
      const templateRes = results[2];
      const statsRes = results[3];
      const emailLogRes = results[4];

      const employeeData =
        empRes.status === "fulfilled" && Array.isArray(empRes.value?.data)
          ? empRes.value.data
          : [];

      const eventData =
        eventRes.status === "fulfilled" && Array.isArray(eventRes.value?.data)
          ? eventRes.value.data
          : [];

      const templateData =
        templateRes.status === "fulfilled" && Array.isArray(templateRes.value?.data)
          ? templateRes.value.data
          : [];

      const statsData =
        statsRes.status === "fulfilled" && statsRes.value?.data
          ? statsRes.value.data
          : null;

      const emailLogData =
        emailLogRes.status === "fulfilled" &&
        Array.isArray(emailLogRes.value?.data?.logs)
          ? emailLogRes.value.data.logs
          : [];

      setEmployees(employeeData);
      setEvents(eventData);
      setTemplates(templateData);
      setEmailLogs(emailLogData);

      if (statsData) {
        setStats({
          totalEmployees: statsData.totalEmployees || employeeData.length || 0,
          todayBirthdays: statsData.todayBirthdays || 0,
          weekBirthdays:
            statsData.weekBirthdays || statsData.thisWeekBirthdays || 0,
          monthBirthdays:
            statsData.monthBirthdays ||
            statsData.thisMonthBirthdays ||
            statsData.birthdayCount ||
            0,
          todayAnniversaries: statsData.todayAnniversaries || 0,
          weekAnniversaries:
            statsData.weekAnniversaries || statsData.thisWeekAnniversaries || 0,
          monthAnniversaries:
            statsData.monthAnniversaries ||
            statsData.thisMonthAnniversaries ||
            statsData.anniversaryCount ||
            0,
          totalTemplates:
            statsData.totalTemplates || statsData.templatesCount || templateData.length || 0,
          totalEmailLogs:
            statsData.totalEmailLogs || emailLogData.length || 0,
          todayEvents: statsData.todayEvents || 0,
          todayWishes: statsData.todayWishes || 0,
          thisWeekWishes: statsData.thisWeekWishes || 0,
          thisMonthWishes: statsData.thisMonthWishes || 0
        });
      } else {
        const today = new Date();

        const fallbackTodayBirthdays = employeeData.filter((emp) =>
          isSameMonthDay(emp.dateOfBirth, today)
        ).length;

        const fallbackWeekBirthdays = employeeData.filter((emp) =>
          isInThisWeek(emp.dateOfBirth, today)
        ).length;

        const fallbackMonthBirthdays = employeeData.filter((emp) =>
          isInThisMonth(emp.dateOfBirth, today)
        ).length;

        const fallbackTodayAnniversaries = employeeData.filter((emp) =>
          isSameMonthDay(emp.joiningDate || emp.workAnniversary, today)
        ).length;

        const fallbackWeekAnniversaries = employeeData.filter((emp) =>
          isInThisWeek(emp.joiningDate || emp.workAnniversary, today)
        ).length;

        const fallbackMonthAnniversaries = employeeData.filter((emp) =>
          isInThisMonth(emp.joiningDate || emp.workAnniversary, today)
        ).length;

        const fallbackTodayEvents = eventData.filter((event) =>
          isSameMonthDay(event.date || event.eventDate, today)
        ).length;

        setStats({
          totalEmployees: employeeData.length,
          todayBirthdays: fallbackTodayBirthdays,
          weekBirthdays: fallbackWeekBirthdays,
          monthBirthdays: fallbackMonthBirthdays,
          todayAnniversaries: fallbackTodayAnniversaries,
          weekAnniversaries: fallbackWeekAnniversaries,
          monthAnniversaries: fallbackMonthAnniversaries,
          totalTemplates: templateData.length,
          totalEmailLogs: emailLogData.length,
          todayEvents: fallbackTodayEvents,
          todayWishes: fallbackTodayBirthdays + fallbackTodayAnniversaries,
          thisWeekWishes: fallbackWeekBirthdays + fallbackWeekAnniversaries,
          thisMonthWishes: fallbackMonthBirthdays + fallbackMonthAnniversaries
        });
      }

      const failedCalls = [];
      if (empRes.status === "rejected") failedCalls.push("employees");
      if (eventRes.status === "rejected") failedCalls.push("events");
      if (templateRes.status === "rejected") failedCalls.push("templates");
      if (statsRes.status === "rejected") failedCalls.push("dashboard");
      if (emailLogRes.status === "rejected") failedCalls.push("email logs");

      if (failedCalls.length === 0) {
        setStatus("Dashboard loaded successfully");
      } else {
        setStatus(
          `Dashboard loaded partially. Failed to load: ${failedCalls.join(", ")}`
        );
      }
    } catch (error) {
      console.error("Dashboard load error:", error);
      setStatus("Failed to load dashboard data");
      setEmployees([]);
      setEvents([]);
      setTemplates([]);
      setEmailLogs([]);
      setStats({
        totalEmployees: 0,
        todayBirthdays: 0,
        weekBirthdays: 0,
        monthBirthdays: 0,
        todayAnniversaries: 0,
        weekAnniversaries: 0,
        monthAnniversaries: 0,
        totalTemplates: 0,
        totalEmailLogs: 0,
        todayEvents: 0,
        todayWishes: 0,
        thisWeekWishes: 0,
        thisMonthWishes: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeSend = async () => {
    try {
      setSendingWelcome(true);
      setWelcomeStatus("Sending welcome emails...");

      const res = await API.post("/api/emails/send-welcome");

      setWelcomeStatus(
        `Sent ${res?.data?.count || 0} welcome emails successfully`
      );

      loadDashboard();
    } catch (error) {
      console.error("Welcome email error:", error);
      setWelcomeStatus(
        error?.response?.data?.error ||
          error?.response?.data?.details ||
          "Failed to send welcome emails"
      );
    } finally {
      setSendingWelcome(false);
    }
  };

  const todayBirthdaysList = useMemo(() => {
    const today = new Date();
    return employees.filter((emp) => isSameMonthDay(emp.dateOfBirth, today));
  }, [employees]);

  const todayAnniversariesList = useMemo(() => {
    const today = new Date();
    return employees.filter((emp) =>
      isSameMonthDay(emp.joiningDate || emp.workAnniversary, today)
    );
  }, [employees]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter((event) => isUpcomingEvent(event.eventDate || event.date))
      .sort(
        (a, b) =>
          new Date(a.eventDate || a.date) - new Date(b.eventDate || b.date)
      );
  }, [events]);

  const recentEmailLogs = useMemo(() => {
    return [...emailLogs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [emailLogs]);

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>{status}</p>
        </div>

        <div style={styles.topActions}>
          <button onClick={loadDashboard} style={styles.refreshButton}>
            Refresh
          </button>

          {user?.role === "admin" && (
            <button
              onClick={handleWelcomeSend}
              style={styles.primaryButton}
              disabled={sendingWelcome}
            >
              {sendingWelcome ? "Sending..." : "Send Monday Welcome Emails"}
            </button>
          )}
        </div>
      </div>

      {welcomeStatus && <div style={styles.infoBanner}>{welcomeStatus}</div>}

      <div style={styles.statsGrid}>
        <StatCard title="Total Employees" value={stats.totalEmployees} />
        <StatCard title="Today Birthdays" value={stats.todayBirthdays} />
        <StatCard title="This Week Birthdays" value={stats.weekBirthdays} />
        <StatCard title="This Month Birthdays" value={stats.monthBirthdays} />
        <StatCard title="Today Anniversaries" value={stats.todayAnniversaries} />
        <StatCard title="This Week Anniversaries" value={stats.weekAnniversaries} />
        <StatCard title="This Month Anniversaries" value={stats.monthAnniversaries} />
        <StatCard title="Today Events" value={stats.todayEvents} />
        <StatCard title="Templates" value={stats.totalTemplates} />
        <StatCard title="Email Logs" value={stats.totalEmailLogs} />
        <StatCard title="Today Wishes" value={stats.todayWishes} />
        <StatCard title="Upcoming Events (7 days)" value={upcomingEvents.length} />
      </div>

      {loading ? (
        <Card title="Dashboard Status">
          <p style={styles.emptyText}>Loading dashboard data...</p>
        </Card>
      ) : (
        <div style={styles.contentGrid}>
          <Card title="Recent Employees">
            {employees.length === 0 ? (
              <p style={styles.emptyText}>No employees found</p>
            ) : (
              <ul style={styles.list}>
                {employees.slice(0, 5).map((emp) => (
                  <li key={emp.id} style={styles.listItem}>
                    <strong>{emp.name}</strong>
                    <div style={styles.muted}>{emp.email}</div>
                    <div style={styles.mutedSmall}>
                      {emp.department || "-"} | {emp.designation || "-"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Today Birthdays">
            {todayBirthdaysList.length === 0 ? (
              <p style={styles.emptyText}>No birthdays today</p>
            ) : (
              <ul style={styles.list}>
                {todayBirthdaysList.map((emp) => (
                  <li key={emp.id} style={styles.listItem}>
                    <strong>{emp.name}</strong>
                    <div style={styles.muted}>{emp.email}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Today Anniversaries">
            {todayAnniversariesList.length === 0 ? (
              <p style={styles.emptyText}>No anniversaries today</p>
            ) : (
              <ul style={styles.list}>
                {todayAnniversariesList.map((emp) => (
                  <li key={emp.id} style={styles.listItem}>
                    <strong>{emp.name}</strong>
                    <div style={styles.muted}>{emp.email}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Upcoming Events">
            {upcomingEvents.length === 0 ? (
              <p style={styles.emptyText}>No upcoming events in the next 7 days</p>
            ) : (
              <ul style={styles.list}>
                {upcomingEvents.slice(0, 5).map((event) => (
                  <li key={event.id} style={styles.listItem}>
                    <strong>{event.title || event.name || "Event"}</strong>
                    <div style={styles.muted}>
                      {event.eventDate || event.date
                        ? new Date(event.eventDate || event.date).toLocaleDateString()
                        : "-"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Recent Templates">
            {templates.length === 0 ? (
              <p style={styles.emptyText}>No templates found</p>
            ) : (
              <ul style={styles.list}>
                {templates.slice(0, 5).map((template) => (
                  <li key={template.id} style={styles.listItem}>
                    <strong>{template.name}</strong>
                    <div style={styles.muted}>{template.type || "-"}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Recent Email Logs">
            {recentEmailLogs.length === 0 ? (
              <p style={styles.emptyText}>No email logs found</p>
            ) : (
              <ul style={styles.list}>
                {recentEmailLogs.map((log) => (
                  <li key={log.id} style={styles.listItem}>
                    <strong>{log.type || "email"}</strong>
                    <div style={styles.muted}>{log.recipient || "-"}</div>
                    <div style={styles.mutedSmall}>
                      {log.status || "-"} |{" "}
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "-"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Quick Summary">
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <strong>Employees:</strong> {stats.totalEmployees}
              </li>
              <li style={styles.listItem}>
                <strong>Birthdays Today:</strong> {stats.todayBirthdays}
              </li>
              <li style={styles.listItem}>
                <strong>Birthdays This Week:</strong> {stats.weekBirthdays}
              </li>
              <li style={styles.listItem}>
                <strong>Birthdays This Month:</strong> {stats.monthBirthdays}
              </li>
              <li style={styles.listItem}>
                <strong>Anniversaries Today:</strong> {stats.todayAnniversaries}
              </li>
              <li style={styles.listItem}>
                <strong>Anniversaries This Week:</strong> {stats.weekAnniversaries}
              </li>
              <li style={styles.listItem}>
                <strong>Anniversaries This Month:</strong> {stats.monthAnniversaries}
              </li>
              <li style={styles.listItem}>
                <strong>Today Events:</strong> {stats.todayEvents}
              </li>
              <li style={styles.listItem}>
                <strong>Templates:</strong> {stats.totalTemplates}
              </li>
              <li style={styles.listItem}>
                <strong>Email Logs:</strong> {stats.totalEmailLogs}
              </li>
            </ul>
          </Card>
        </div>
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

function Card({ title, children }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      {children}
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    fontFamily: "Inter, sans-serif"
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px"
  },
  title: {
    margin: 0,
    fontSize: "38px",
    fontWeight: "800",
    color: "#1f1a17"
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#6c6258",
    fontSize: "15px"
  },
  topActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },
  refreshButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#333",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600"
  },
  primaryButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#8b5e3c",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600"
  },
  infoBanner: {
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#f7efe6",
    color: "#8b5e3c",
    border: "1px solid #eadfce",
    fontWeight: "600"
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
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px"
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(44, 29, 12, 0.08)",
    border: "1px solid #eadfce"
  },
  cardTitle: {
    margin: 0,
    marginBottom: "14px",
    color: "#241c15",
    fontSize: "20px",
    fontWeight: "700"
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  listItem: {
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f0e7dc"
  },
  muted: {
    color: "#666",
    fontSize: "14px",
    marginTop: "4px"
  },
  mutedSmall: {
    color: "#8a7c70",
    fontSize: "13px",
    marginTop: "4px"
  },
  emptyText: {
    margin: 0,
    color: "#6c6258",
    fontSize: "14px"
  }
};