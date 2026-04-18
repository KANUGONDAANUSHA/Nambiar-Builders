import { useState } from "react";
import API from "../api/api";

export default function EmailCenter() {
  const [customForm, setCustomForm] = useState({
    to: "",
    subject: "",
    message: "",
  });

  const [employeeId, setEmployeeId] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getErrorMessage = (error, fallback) => {
    return (
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      fallback
    );
  };

  const handleSendCustom = async (e) => {
    e.preventDefault();

    if (!customForm.to || !customForm.subject || !customForm.message) {
      alert("To, subject and message are required");
      return;
    }

    try {
      setSending(true);
      setStatusMessage("");
      setErrorMessage("");

      const payload = {
        to: customForm.to.trim(),
        subject: customForm.subject.trim(),
        message: customForm.message.trim(),
      };

      const res = await API.post("/api/emails/custom", payload);

      setStatusMessage(res.data?.message || "Custom email sent successfully");
      setCustomForm({
        to: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("CUSTOM EMAIL ERROR:", error);

      const msg = getErrorMessage(error, "Failed to send custom email");
      setErrorMessage(msg);
      alert(msg);
    } finally {
      setSending(false);
    }
  };

  const handleBirthdayEmail = async () => {
    if (!employeeId) {
      alert("Please enter Employee DB ID");
      return;
    }

    try {
      setSending(true);
      setStatusMessage("");
      setErrorMessage("");

      const res = await API.post(`/api/emails/birthday/${employeeId}`);
      setStatusMessage(res.data?.message || "Birthday email sent successfully");
    } catch (error) {
      console.error("BIRTHDAY EMAIL ERROR:", error);

      const msg = getErrorMessage(error, "Failed to send birthday email");
      setErrorMessage(msg);
      alert(msg);
    } finally {
      setSending(false);
    }
  };

  const handleAnniversaryEmail = async () => {
    if (!employeeId) {
      alert("Please enter Employee DB ID");
      return;
    }

    try {
      setSending(true);
      setStatusMessage("");
      setErrorMessage("");

      const res = await API.post(`/api/emails/anniversary/${employeeId}`);
      setStatusMessage(
        res.data?.message || "Anniversary email sent successfully"
      );
    } catch (error) {
      console.error("ANNIVERSARY EMAIL ERROR:", error);

      const msg = getErrorMessage(error, "Failed to send anniversary email");
      setErrorMessage(msg);
      alert(msg);
    } finally {
      setSending(false);
    }
  };

  const handleRunJob = async () => {
    try {
      setSending(true);
      setStatusMessage("");
      setErrorMessage("");

      const res = await API.post("/api/emails/run-job");
      setStatusMessage(res.data?.message || "Daily job executed successfully");
    } catch (error) {
      console.error("RUN JOB ERROR:", error);

      const msg = getErrorMessage(error, "Failed to run job");
      setErrorMessage(msg);
      alert(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Email Center</h1>
          <p style={styles.subtitle}>
            Send custom emails and manually trigger employee emails.
          </p>
        </div>
      </div>

      {statusMessage ? <div style={styles.successBox}>{statusMessage}</div> : null}
      {errorMessage ? <div style={styles.errorBox}>{errorMessage}</div> : null}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Send Custom Email</h2>

        <form onSubmit={handleSendCustom} style={styles.form}>
          <input
            type="email"
            name="to"
            placeholder="Recipient email"
            value={customForm.to}
            onChange={handleCustomChange}
            style={styles.input}
          />

          <input
            type="text"
            name="subject"
            placeholder="Email subject"
            value={customForm.subject}
            onChange={handleCustomChange}
            style={styles.input}
          />

          <textarea
            name="message"
            placeholder="Write your email message here"
            value={customForm.message}
            onChange={handleCustomChange}
            style={styles.textarea}
          />

          <button type="submit" style={styles.primaryButton} disabled={sending}>
            {sending ? "Sending..." : "Send Custom Email"}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Send Employee Emails</h2>

        <input
          type="number"
          placeholder="Employee DB ID (example: 1)"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          style={styles.input}
        />

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={handleBirthdayEmail}
            disabled={sending}
          >
            {sending ? "Please wait..." : "Birthday Email"}
          </button>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={handleAnniversaryEmail}
            disabled={sending}
          >
            {sending ? "Please wait..." : "Anniversary Email"}
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Automation</h2>

        <button
          type="button"
          style={styles.primaryButton}
          onClick={handleRunJob}
          disabled={sending}
        >
          {sending ? "Please wait..." : "Run Daily Job Manually"}
        </button>
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
  successBox: {
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#edf7ed",
    color: "#2e6b3a",
    border: "1px solid #b7d8bc",
    fontWeight: "600",
  },
  errorBox: {
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#fdeeee",
    color: "#a12f2f",
    border: "1px solid #efc2c2",
    fontWeight: "600",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(44, 29, 12, 0.08)",
    border: "1px solid #eadfce",
    marginBottom: "20px",
  },
  cardTitle: {
    margin: "0 0 18px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#241c15",
  },
  form: {
    display: "grid",
    gap: "14px",
  },
  input: {
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #d9c8b4",
    outline: "none",
    padding: "0 14px",
    fontSize: "14px",
    background: "#fcfaf7",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    minHeight: "180px",
    borderRadius: "12px",
    border: "1px solid #d9c8b4",
    outline: "none",
    padding: "14px",
    fontSize: "14px",
    background: "#fcfaf7",
    resize: "vertical",
    fontFamily: "inherit",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "14px",
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
    cursor: "pointer",
  },
};