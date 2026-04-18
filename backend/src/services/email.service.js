import nodemailer from "nodemailer";
import prisma from "../config/db.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const replaceTemplateVariables = (text, employee = {}) => {
  if (!text) return "";

  return text
    .replaceAll("{{name}}", employee.name || "Employee")
    .replaceAll("{{email}}", employee.email || "")
    .replaceAll("{{employeeId}}", employee.employeeId || "")
    .replaceAll("{{department}}", employee.department || "")
    .replaceAll("{{designation}}", employee.designation || "");
};

const getTemplateByType = async (type) => {
  try {
    return await prisma.template.findFirst({
      where: { type },
      orderBy: { id: "desc" },
    });
  } catch (error) {
    console.error("GET TEMPLATE ERROR:", error);
    return null;
  }
};

const logEmail = async ({
  employeeId = null,
  email,
  type,
  subject,
  status,
  error = null,
}) => {
  try {
    await prisma.emailLog.create({
      data: {
        employeeId,
        email,
        type,
        subject,
        status,
        error,
      },
    });
  } catch (logError) {
    console.error("EMAIL LOG ERROR:", logError);
  }
};

const sendEmailWithLog = async ({
  employee = null,
  to,
  subject,
  html,
  type,
}) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    await logEmail({
      employeeId: employee?.id || null,
      email: to,
      type,
      subject,
      status: "sent",
      error: null,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("SEND EMAIL ERROR:", error);

    await logEmail({
      employeeId: employee?.id || null,
      email: to,
      type,
      subject,
      status: "failed",
      error: error.message,
    });

    return {
      success: false,
      error: error.message,
    };
  }
};

export const verifyEmailTransporter = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email transporter is ready");
    return { success: true };
  } catch (error) {
    console.error("❌ EMAIL TRANSPORT ERROR:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendBirthdayEmail = async (employee) => {
  try {
    if (!employee?.email) {
      return { success: false, error: "Employee email is missing" };
    }

    const template = await getTemplateByType("birthday");

    const subject = template
      ? replaceTemplateVariables(template.subject, employee)
      : `Happy Birthday ${employee.name || "Employee"}!`;

    const html = template
      ? replaceTemplateVariables(template.html, employee)
      : `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Happy Birthday, ${employee.name || "Employee"}! 🎉</h2>
          <p>Wishing you a wonderful birthday filled with happiness and success.</p>
          <p>Best wishes,<br/>Nambiar Builders Pvt Ltd</p>
        </div>
      `;

    return await sendEmailWithLog({
      employee,
      to: employee.email,
      subject,
      html,
      type: "birthday",
    });
  } catch (error) {
    console.error("SEND BIRTHDAY EMAIL ERROR:", error);
    return { success: false, error: error.message };
  }
};

export const sendAnniversaryEmail = async (employee) => {
  try {
    if (!employee?.email) {
      return { success: false, error: "Employee email is missing" };
    }

    const template = await getTemplateByType("anniversary");

    const subject = template
      ? replaceTemplateVariables(template.subject, employee)
      : `Happy Work Anniversary ${employee.name || "Employee"}!`;

    const html = template
      ? replaceTemplateVariables(template.html, employee)
      : `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Happy Work Anniversary, ${employee.name || "Employee"}! 🎉</h2>
          <p>Thank you for being a valuable part of Nambiar Builders Pvt Ltd.</p>
          <p>Best wishes,<br/>Nambiar Builders Pvt Ltd</p>
        </div>
      `;

    return await sendEmailWithLog({
      employee,
      to: employee.email,
      subject,
      html,
      type: "anniversary",
    });
  } catch (error) {
    console.error("SEND ANNIVERSARY EMAIL ERROR:", error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (employee) => {
  try {
    if (!employee?.email) {
      return { success: false, error: "Employee email is missing" };
    }

    const template = await getTemplateByType("welcome");

    const subject = template
      ? replaceTemplateVariables(template.subject, employee)
      : "Welcome to Nambiar Builders Pvt Ltd";

    const html = template
      ? replaceTemplateVariables(template.html, employee)
      : `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Welcome ${employee.name || "Team Member"} 👋</h2>
          <p>We are happy to have you at <b>Nambiar Builders Pvt Ltd</b>.</p>
          <p>Best regards,<br/>Nambiar Builders Pvt Ltd</p>
        </div>
      `;

    return await sendEmailWithLog({
      employee,
      to: employee.email,
      subject,
      html,
      type: "welcome",
    });
  } catch (error) {
    console.error("SEND WELCOME EMAIL ERROR:", error);
    return { success: false, error: error.message };
  }
};

export const sendCustomEmail = async ({ to, subject, html }) => {
  try {
    if (!to || !subject || !html) {
      return {
        success: false,
        error: "to, subject and html are required",
      };
    }

    return await sendEmailWithLog({
      employee: null,
      to,
      subject,
      html,
      type: "custom",
    });
  } catch (error) {
    console.error("SEND CUSTOM EMAIL ERROR:", error);
    return { success: false, error: error.message };
  }
};

export default transporter;