import { useEffect, useState } from "react";
import API from "../api/api";

const defaultSettings = {
  companyName: "Nambiar Builders",
  supportEmail: "support@nambiarbuilders.com",
  senderName: "Nambiar Builders Pvt Ltd",
  birthdayEnabled: true,
  anniversaryEnabled: true,
  welcomeEnabled: true,
  dailyCronTime: "09:00",
  theme: "brown"
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const applySettings = (data = {}) => {
    setSettings({
      companyName: data.companyName ?? defaultSettings.companyName,
      supportEmail: data.supportEmail ?? defaultSettings.supportEmail,
      senderName: data.senderName ?? defaultSettings.senderName,
      birthdayEnabled:
        typeof data.birthdayEnabled === "boolean"
          ? data.birthdayEnabled
          : defaultSettings.birthdayEnabled,
      anniversaryEnabled:
        typeof data.anniversaryEnabled === "boolean"
          ? data.anniversaryEnabled
          : defaultSettings.anniversaryEnabled,
      welcomeEnabled:
        typeof data.welcomeEnabled === "boolean"
          ? data.welcomeEnabled
          : defaultSettings.welcomeEnabled,
      dailyCronTime: data.dailyCronTime ?? defaultSettings.dailyCronTime,
      theme: data.theme ?? defaultSettings.theme
    });
  };

  const showTemporaryMessage = (setter, value) => {
    setter(value);
    setTimeout(() => setter(""), 2500);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await API.get("/api/settings");
      const data = res.data?.data || {};

      applySettings(data);
    } catch (error) {
      console.error("LOAD SETTINGS ERROR:", error);
      applySettings(defaultSettings);
      setErrorMessage(
        error?.response?.data?.error || error?.message || "Failed to load settings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSavedMessage("");
      setErrorMessage("");

      const payload = {
        companyName: settings.companyName.trim(),
        supportEmail: settings.supportEmail.trim(),
        senderName: settings.senderName.trim(),
        birthdayEnabled: settings.birthdayEnabled,
        anniversaryEnabled: settings.anniversaryEnabled,
        welcomeEnabled: settings.welcomeEnabled,
        dailyCronTime: settings.dailyCronTime,
        theme: settings.theme
      };

      const res = await API.put("/api/settings", payload);
      const data = res.data?.data || {};

      applySettings(data);
      showTemporaryMessage(
        setSavedMessage,
        res.data?.message || "Settings saved successfully"
      );
    } catch (error) {
      console.error("SAVE SETTINGS ERROR:", error);
      showTemporaryMessage(
        setErrorMessage,
        error?.response?.data?.error || error?.message || "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      setSavedMessage("");
      setErrorMessage("");

      const res = await API.post("/api/settings/reset");
      const data = res.data?.data || {};

      applySettings(data);
      showTemporaryMessage(
        setSavedMessage,
        res.data?.message || "Settings reset successfully"
      );
    } catch (error) {
      console.error("RESET SETTINGS ERROR:", error);
      showTemporaryMessage(
        setErrorMessage,
        error?.response?.data?.error || error?.message || "Failed to reset settings"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>
            Manage company preferences and email automation defaults.
          </p>
        </div>
      </div>

      {savedMessage ? <div style={styles.successBox}>{savedMessage}</div> : null}
      {errorMessage ? <div style={styles.errorBox}>{errorMessage}</div> : null}

      {loading ? (
        <div style={styles.card}>
          <p style={styles.infoText}>Loading settings...</p>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Company Settings</h2>
              <p style={styles.cardText}>
                Update basic company information used in the application.
              </p>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={settings.companyName}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Support Email</label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={settings.supportEmail}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroupFull}>
                  <label style={styles.label}>Sender Name</label>
                  <input
                    type="text"
                    name="senderName"
                    value={settings.senderName}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Automation Settings</h2>
              <p style={styles.cardText}>
                Control which automated email features are enabled.
              </p>

              <div style={styles.toggleList}>
                <label style={styles.toggleItem}>
                  <span>Enable Birthday Emails</span>
                  <input
                    type="checkbox"
                    name="birthdayEnabled"
                    checked={settings.birthdayEnabled}
                    onChange={handleChange}
                  />
                </label>

                <label style={styles.toggleItem}>
                  <span>Enable Anniversary Emails</span>
                  <input
                    type="checkbox"
                    name="anniversaryEnabled"
                    checked={settings.anniversaryEnabled}
                    onChange={handleChange}
                  />
                </label>

                <label style={styles.toggleItem}>
                  <span>Enable Welcome Emails</span>
                  <input
                    type="checkbox"
                    name="welcomeEnabled"
                    checked={settings.welcomeEnabled}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div style={{ marginTop: "18px" }}>
                <label style={styles.label}>Daily Cron Time</label>
                <input
                  type="time"
                  name="dailyCronTime"
                  value={settings.dailyCronTime}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Appearance</h2>
              <p style={styles.cardText}>Select the preferred theme option.</p>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Theme</label>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="brown">Brown</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Application Info</h2>
              <p style={styles.infoText}>
                <strong>Project:</strong> Nambiar Builders Email Wishes Portal
              </p>
              <p style={styles.infoText}>
                <strong>Version:</strong> 1.0.0
              </p>
              <p style={styles.infoText}>
                <strong>Status:</strong> Backend-connected settings
              </p>
            </div>
          </div>

          <div style={styles.buttonRow}>
            <button
              style={{
                ...styles.primaryButton,
                ...(saving ? styles.disabledButton : {})
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>

            <button
              style={{
                ...styles.secondaryButton,
                ...(saving ? styles.disabledButton : {})
              }}
              onClick={handleReset}
              disabled={saving}
            >
              {saving ? "Please wait..." : "Reset Settings"}
            </button>
          </div>
        </>
      )}
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
  successBox: {
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#edf7ed",
    color: "#2e6b3a",
    border: "1px solid #b7d8bc",
    fontWeight: "600"
  },
  errorBox: {
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#fdeeee",
    color: "#a33a3a",
    border: "1px solid #efc0c0",
    fontWeight: "600"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "20px"
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
    margin: "6px 0 18px 0",
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
    background: "#fcfaf7",
    width: "100%",
    boxSizing: "border-box"
  },
  toggleList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "10px"
  },
  toggleItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    background: "#f9f4ee",
    border: "1px solid #eadfce",
    borderRadius: "12px",
    color: "#2f241b",
    fontSize: "14px",
    fontWeight: "600"
  },
  infoText: {
    margin: "10px 0",
    color: "#5d5247",
    fontSize: "14px"
  },
  buttonRow: {
    display: "flex",
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
  disabledButton: {
    opacity: 0.7,
    cursor: "not-allowed"
  }
};