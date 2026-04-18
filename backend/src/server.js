import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import employeeRoutes from "./routes/employee.routes.js";
import eventRoutes from "./routes/event.routes.js";
import templateRoutes from "./routes/template.routes.js";
import emailRoutes from "./routes/email.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import emailLogRoutes from "./routes/emailLog.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully"
  });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/email-logs", emailLogRoutes);
app.use("/api/settings", settingsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});