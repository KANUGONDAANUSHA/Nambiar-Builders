import express from "express";
import prisma from "../config/db.js";
import { sendMail, testTransporter } from "../utils/mailer.js";

const router = express.Router();

function isSameMonthDay(dateValue, today = new Date()) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function messageToHtml(message = "") {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      ${String(message).replace(/\n/g, "<br />")}
    </div>
  `;
}

async function saveEmailLogSafe(data) {
  try {
    await prisma.emailLog.create({ data });
  } catch (dbError) {
    console.error("EMAIL LOG SAVE ERROR:", dbError);
  }
}

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Email routes working",
  });
});

router.get("/test-login", async (req, res) => {
  try {
    const result = await testTransporter();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.message,
      });
    }

    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("TEST LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "SMTP login test failed",
    });
  }
});

router.post("/custom", async (req, res) => {
  try {
    const { to, subject, html, message } = req.body;

    const finalTo = to?.trim().toLowerCase();
    const finalSubject = subject?.trim();
    const finalText = message?.trim() || "";
    const finalHtml = html || messageToHtml(finalText);

    if (!finalTo || !finalSubject || (!html && !finalText)) {
      return res.status(400).json({
        success: false,
        error: "to, subject and message are required",
      });
    }

    const result = await sendMail({
      to: finalTo,
      subject: finalSubject,
      html: finalHtml,
      text: finalText,
    });

    await saveEmailLogSafe({
      recipient: finalTo,
      subject: finalSubject,
      type: "custom",
      status: result.success ? "sent" : "failed",
      message: result.message || null,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.message || "Failed to send email",
      });
    }

    return res.json({
      success: true,
      message: "Custom email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("CUSTOM EMAIL ROUTE ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send custom email",
    });
  }
});

router.post("/birthday/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid employee id",
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    if (!employee.email) {
      return res.status(400).json({
        success: false,
        error: "Employee email is missing",
      });
    }

    const subject = `Happy Birthday ${employee.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Happy Birthday ${employee.name}</h2>
        <p>Wishing you happiness and success.</p>
      </div>
    `;

    const result = await sendMail({
      to: employee.email,
      subject,
      html,
      text: `Happy Birthday ${employee.name}. Wishing you happiness and success.`,
    });

    await saveEmailLogSafe({
      recipient: employee.email,
      subject,
      type: "birthday",
      status: result.success ? "sent" : "failed",
      message: result.message || null,
      employeeId: employee.id,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.message || "Failed to send birthday email",
      });
    }

    return res.json({
      success: true,
      message: `Birthday email sent to ${employee.name}`,
    });
  } catch (error) {
    console.error("BIRTHDAY EMAIL ROUTE ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send birthday email",
    });
  }
});

router.post("/anniversary/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid employee id",
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    if (!employee.email) {
      return res.status(400).json({
        success: false,
        error: "Employee email is missing",
      });
    }

    const subject = `Happy Work Anniversary ${employee.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Happy Work Anniversary ${employee.name}</h2>
        <p>Thank you for being part of Nambiar Builders.</p>
      </div>
    `;

    const result = await sendMail({
      to: employee.email,
      subject,
      html,
      text: `Happy Work Anniversary ${employee.name}. Thank you for being part of Nambiar Builders.`,
    });

    await saveEmailLogSafe({
      recipient: employee.email,
      subject,
      type: "anniversary",
      status: result.success ? "sent" : "failed",
      message: result.message || null,
      employeeId: employee.id,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.message || "Failed to send anniversary email",
      });
    }

    return res.json({
      success: true,
      message: `Anniversary email sent to ${employee.name}`,
    });
  } catch (error) {
    console.error("ANNIVERSARY EMAIL ROUTE ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send anniversary email",
    });
  }
});

router.post("/send-welcome", async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { id: "desc" },
    });

    if (!employees.length) {
      return res.json({
        success: true,
        count: 0,
        failedCount: 0,
        failed: [],
      });
    }

    let sentCount = 0;
    const failed = [];

    for (const emp of employees) {
      if (!emp.email) {
        failed.push({
          id: emp.id,
          name: emp.name,
          reason: "Missing email",
        });
        continue;
      }

      const subject = `Welcome to Nambiar Builders, ${emp.name}`;
      const html = `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome ${emp.name}</h2>
          <p>We are happy to have you with Nambiar Builders Pvt Ltd.</p>
        </div>
      `;

      const result = await sendMail({
        to: emp.email,
        subject,
        html,
        text: `Welcome ${emp.name}. We are happy to have you with Nambiar Builders Pvt Ltd.`,
      });

      await saveEmailLogSafe({
        recipient: emp.email,
        subject,
        type: "welcome",
        status: result.success ? "sent" : "failed",
        message: result.message || null,
        employeeId: emp.id,
      });

      if (result.success) {
        sentCount++;
      } else {
        failed.push({
          id: emp.id,
          name: emp.name,
          reason: result.message || "Failed to send",
        });
      }
    }

    return res.json({
      success: true,
      message: "Welcome email process completed",
      count: sentCount,
      failedCount: failed.length,
      failed,
    });
  } catch (error) {
    console.error("WELCOME EMAIL ROUTE ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send welcome emails",
    });
  }
});

router.post("/run-job", async (req, res) => {
  try {
    const employees = await prisma.employee.findMany();
    const today = new Date();

    let birthdayCount = 0;
    let anniversaryCount = 0;

    for (const emp of employees) {
      if (!emp.email) continue;

      if (isSameMonthDay(emp.dateOfBirth, today)) {
        const subject = `Happy Birthday ${emp.name}`;
        const result = await sendMail({
          to: emp.email,
          subject,
          html: `<h2>${subject}</h2>`,
          text: subject,
        });

        await saveEmailLogSafe({
          recipient: emp.email,
          subject,
          type: "birthday",
          status: result.success ? "sent" : "failed",
          message: result.message || null,
          employeeId: emp.id,
        });

        if (result.success) birthdayCount++;
      }

      if (isSameMonthDay(emp.joiningDate, today)) {
        const subject = `Happy Work Anniversary ${emp.name}`;
        const result = await sendMail({
          to: emp.email,
          subject,
          html: `<h2>${subject}</h2>`,
          text: subject,
        });

        await saveEmailLogSafe({
          recipient: emp.email,
          subject,
          type: "anniversary",
          status: result.success ? "sent" : "failed",
          message: result.message || null,
          employeeId: emp.id,
        });

        if (result.success) anniversaryCount++;
      }
    }

    return res.json({
      success: true,
      message: "Email job executed manually",
      result: {
        birthdayCount,
        anniversaryCount,
        totalSent: birthdayCount + anniversaryCount,
      },
    });
  } catch (error) {
    console.error("RUN JOB ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to run email job",
    });
  }
});

export default router;