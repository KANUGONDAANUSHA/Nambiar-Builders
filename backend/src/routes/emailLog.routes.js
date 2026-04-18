import express from "express";
import prisma from "../config/db.js";

const router = express.Router();

function normalizeText(value) {
  if (value === undefined || value === null) return null;
  return String(value).trim();
}

function normalizeLower(value) {
  if (value === undefined || value === null) return null;
  return String(value).trim().toLowerCase();
}

function parseId(value) {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
}

// GET EMAIL LOG SUMMARY + ALL LOGS
router.get("/", async (req, res) => {
  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { employee: true },
    });

    const scheduled = logs.filter((log) => log.status === "scheduled").length;
    const sent = logs.filter((log) => log.status === "sent").length;
    const delivered = logs.filter((log) => log.status === "delivered").length;
    const failed = logs.filter((log) => log.status === "failed").length;

    return res.status(200).json({
      success: true,
      scheduled,
      sent,
      delivered,
      failed,
      total: logs.length,
      logs,
    });
  } catch (error) {
    console.error("GET EMAIL LOGS ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch email logs",
    });
  }
});

// GET SINGLE EMAIL LOG
router.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Invalid email log id",
      });
    }

    const log = await prisma.emailLog.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: "Email log not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error("GET SINGLE EMAIL LOG ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch email log",
    });
  }
});

// CREATE EMAIL LOG
router.post("/", async (req, res) => {
  try {
    const { recipient, subject, type, status, message, employeeId } = req.body;

    if (!recipient || !subject || !type || !status) {
      return res.status(400).json({
        success: false,
        error: "recipient, subject, type and status are required",
      });
    }

    const parsedEmployeeId =
      employeeId !== undefined && employeeId !== null && employeeId !== ""
        ? parseId(employeeId)
        : null;

    if (
      employeeId !== undefined &&
      employeeId !== null &&
      employeeId !== "" &&
      !parsedEmployeeId
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid employeeId",
      });
    }

    const log = await prisma.emailLog.create({
      data: {
        recipient: normalizeLower(recipient),
        subject: normalizeText(subject),
        type: normalizeText(type),
        status: normalizeLower(status),
        message: message ? String(message) : null,
        employeeId: parsedEmployeeId,
      },
      include: { employee: true },
    });

    return res.status(201).json({
      success: true,
      message: "Email log created successfully",
      data: log,
    });
  } catch (error) {
    console.error("CREATE EMAIL LOG ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create email log",
    });
  }
});

// UPDATE EMAIL LOG
router.put("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Invalid email log id",
      });
    }

    const existingLog = await prisma.emailLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      return res.status(404).json({
        success: false,
        error: "Email log not found",
      });
    }

    const { recipient, subject, type, status, message, employeeId } = req.body;

    let parsedEmployeeId = existingLog.employeeId;

    if (employeeId !== undefined) {
      if (employeeId === null || employeeId === "") {
        parsedEmployeeId = null;
      } else {
        const convertedEmployeeId = parseId(employeeId);

        if (!convertedEmployeeId) {
          return res.status(400).json({
            success: false,
            error: "Invalid employeeId",
          });
        }

        parsedEmployeeId = convertedEmployeeId;
      }
    }

    const updatedLog = await prisma.emailLog.update({
      where: { id },
      data: {
        recipient:
          recipient !== undefined
            ? normalizeLower(recipient)
            : existingLog.recipient,
        subject:
          subject !== undefined
            ? normalizeText(subject)
            : existingLog.subject,
        type: type !== undefined ? normalizeText(type) : existingLog.type,
        status:
          status !== undefined
            ? normalizeLower(status)
            : existingLog.status,
        message:
          message !== undefined
            ? message === null || message === ""
              ? null
              : String(message)
            : existingLog.message,
        employeeId: parsedEmployeeId,
      },
      include: { employee: true },
    });

    return res.status(200).json({
      success: true,
      message: "Email log updated successfully",
      data: updatedLog,
    });
  } catch (error) {
    console.error("UPDATE EMAIL LOG ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update email log",
    });
  }
});

// DELETE EMAIL LOG
router.delete("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Invalid email log id",
      });
    }

    const existingLog = await prisma.emailLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      return res.status(404).json({
        success: false,
        error: "Email log not found",
      });
    }

    await prisma.emailLog.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Email log deleted successfully",
    });
  } catch (error) {
    console.error("DELETE EMAIL LOG ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete email log",
    });
  }
});

export default router;