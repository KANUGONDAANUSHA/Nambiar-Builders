import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import API from "../api/api";

const initialForm = {
  employeeId: "",
  name: "",
  email: "",
  department: "",
  designation: "",
  dateOfBirth: "",
  joiningDate: ""
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/employees");
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Load employees error:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleAddOrUpdateEmployee = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      alert("Name and Email are required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        employeeId: form.employeeId.trim() || null,
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim() || null,
        designation: form.designation.trim() || null,
        dateOfBirth: form.dateOfBirth || null,
        joiningDate: form.joiningDate || null
      };

      if (editingId) {
        await API.put(`/api/employees/${editingId}`, payload);
        alert("Employee updated successfully");
      } else {
        await API.post("/api/employees", payload);
        alert("Employee added successfully");
      }

      resetForm();
      await loadEmployees();
    } catch (error) {
      console.error("Save employee error:", error);
      alert(
        error?.response?.data?.error ||
          "Failed to save employee. Please check backend."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingId(employee.id);
    setForm({
      employeeId: employee.employeeId || "",
      name: employee.name || "",
      email: employee.email || "",
      department: employee.department || "",
      designation: employee.designation || "",
      dateOfBirth: formatDateForInput(employee.dateOfBirth),
      joiningDate: formatDateForInput(employee.joiningDate)
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteEmployee = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirmed) return;

    try {
      await API.delete(`/api/employees/${id}`);
      alert("Employee deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      await loadEmployees();
    } catch (error) {
      console.error("Delete employee error:", error);
      alert(
        error?.response?.data?.error ||
          "Failed to delete employee. Please check backend."
      );
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const normalizeImportedDate = (value) => {
    if (!value) return null;

    if (typeof value === "number") {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (!parsed) return null;

      const month = String(parsed.m).padStart(2, "0");
      const day = String(parsed.d).padStart(2, "0");
      return `${parsed.y}-${month}-${day}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toISOString().split("T")[0];
  };

  const handleImportFile = async () => {
    if (!selectedFile) {
      alert("Please choose a file first");
      return;
    }

    try {
      setImporting(true);

      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) {
        alert("File is empty");
        return;
      }

      const mappedRows = rows.map((row) => ({
        employeeId: row.employeeId || row.EmployeeId || row["Employee ID"] || "",
        name: row.name || row.Name || "",
        email: row.email || row.Email || "",
        department: row.department || row.Department || "",
        designation: row.designation || row.Designation || "",
        dateOfBirth: normalizeImportedDate(
          row.dateOfBirth ||
            row.DateOfBirth ||
            row["Date Of Birth"] ||
            row["Date of Birth"] ||
            ""
        ),
        joiningDate: normalizeImportedDate(
          row.joiningDate ||
            row.JoiningDate ||
            row["Joining Date"] ||
            row["Date of Joining"] ||
            ""
        )
      }));

      let successCount = 0;
      let skipCount = 0;
      const failedRows = [];

      for (const employee of mappedRows) {
        if (!employee.name || !employee.email) {
          skipCount++;
          continue;
        }

        try {
          await API.post("/api/employees", {
            employeeId: employee.employeeId || null,
            name: employee.name.trim(),
            email: employee.email.trim(),
            department: employee.department?.trim() || null,
            designation: employee.designation?.trim() || null,
            dateOfBirth: employee.dateOfBirth || null,
            joiningDate: employee.joiningDate || null
          });

          successCount++;
        } catch (error) {
          failedRows.push({
            name: employee.name,
            email: employee.email,
            reason: error?.response?.data?.error || "Failed to import"
          });
        }
      }

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadEmployees();

      alert(
        `Import completed.\nSuccess: ${successCount}\nSkipped: ${skipCount}\nFailed: ${failedRows.length}`
      );
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to import file");
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        "Employee ID": "EMP001",
        Name: "Vijay Kumar",
        Email: "vijay@example.com",
        Department: "HR",
        Designation: "Manager",
        "Date of Birth": "1998-06-15",
        "Date of Joining": "2024-01-10"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employee_sample_file.xlsx");
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const value = search.toLowerCase();
      return (
        (emp.name || "").toLowerCase().includes(value) ||
        (emp.email || "").toLowerCase().includes(value) ||
        (emp.department || "").toLowerCase().includes(value) ||
        (emp.designation || "").toLowerCase().includes(value) ||
        (emp.employeeId || "").toLowerCase().includes(value)
      );
    });
  }, [employees, search]);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Employees</h1>
          <p style={styles.subtitle}>
            Manage employee details, import records, and search your team data.
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                {editingId ? "Edit Employee" : "Add Employee"}
              </h2>
              <p style={styles.cardText}>
                {editingId
                  ? "Update employee details below."
                  : "Fill the form below to add a new employee."}
              </p>
            </div>
          </div>

          <form onSubmit={handleAddOrUpdateEmployee}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="Enter employee ID"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="Enter department"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="Enter designation"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Date of Joining</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={form.joiningDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button type="submit" style={styles.primaryButton} disabled={saving}>
                {saving
                  ? editingId
                    ? "Updating..."
                    : "Saving..."
                  : editingId
                  ? "Update Employee"
                  : "Add Employee"}
              </button>

              {editingId && (
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Import Employees</h2>
              <p style={styles.cardText}>
                Upload Excel or CSV file to add multiple employees.
              </p>
            </div>
          </div>

          <div style={styles.importBox}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              style={styles.fileInput}
            />

            <div style={styles.importActions}>
              <button
                type="button"
                onClick={handleImportFile}
                style={styles.primaryButton}
                disabled={importing}
              >
                {importing ? "Importing..." : "Import File"}
              </button>

              <button
                type="button"
                onClick={handleDownloadSample}
                style={styles.secondaryButton}
              >
                Download Sample
              </button>
            </div>

            {selectedFile && (
              <p style={styles.fileName}>Selected file: {selectedFile.name}</p>
            )}
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.cardTitle}>Employee List</h2>
            <p style={styles.cardText}>
              View all employees and quickly search records.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Total Employees</span>
            <strong style={styles.statValue}>{employees.length}</strong>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Showing Results</span>
            <strong style={styles.statValue}>{filteredEmployees.length}</strong>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Date of Birth</th>
                <th style={styles.th}>Date of Joining</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={styles.emptyCell}>
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.emptyCell}>
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} style={styles.tr}>
                    <td style={styles.td}>{emp.employeeId || "-"}</td>
                    <td style={styles.td}>{emp.name || "-"}</td>
                    <td style={styles.td}>{emp.email || "-"}</td>
                    <td style={styles.td}>{emp.department || "-"}</td>
                    <td style={styles.td}>{emp.designation || "-"}</td>
                    <td style={styles.td}>
                      {formatDateForInput(emp.dateOfBirth) || "-"}
                    </td>
                    <td style={styles.td}>
                      {formatDateForInput(emp.joiningDate) || "-"}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          type="button"
                          style={styles.editButton}
                          onClick={() => handleEditEmployee(emp)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          style={styles.deleteButton}
                          onClick={() => handleDeleteEmployee(emp.id)}
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
    gridTemplateColumns: "2fr 1fr",
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
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
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
  fileInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px dashed #cdb49a",
    background: "#fcfaf7",
    cursor: "pointer"
  },
  buttonRow: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-start",
    gap: "12px",
    flexWrap: "wrap"
  },
  importBox: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  importActions: {
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
  fileName: {
    margin: 0,
    fontSize: "14px",
    color: "#5d5247"
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
    minWidth: "1200px",
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
    verticalAlign: "middle"
  },
  emptyCell: {
    padding: "30px",
    textAlign: "center",
    color: "#7b6f63",
    fontSize: "15px"
  }
};