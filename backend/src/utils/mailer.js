import nodemailer from "nodemailer";

export function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS missing in .env");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

export async function testTransporter() {
  try {
    const transporter = createTransporter();
    await transporter.verify();

    return {
      success: true,
      message: "SMTP login successful",
    };
  } catch (error) {
    console.error("SMTP VERIFY ERROR:", error);

    let message = error?.message || "SMTP login failed";

    if (
      message.includes("Invalid login") ||
      message.includes("Username and Password not accepted")
    ) {
      message =
        "Invalid Gmail login. Check EMAIL_USER and use a valid Google App Password.";
    }

    return {
      success: false,
      message,
    };
  }
}

export async function sendMail({ to, subject, html, text }) {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"Nambiar Builders" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || "",
    });

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("MAIL ERROR:", error);

    let message = error?.message || "Failed to send email";

    if (
      message.includes("Invalid login") ||
      message.includes("Username and Password not accepted")
    ) {
      message =
        "Invalid Gmail login. Check EMAIL_USER and use a valid Google App Password.";
    }

    return {
      success: false,
      message,
    };
  }
}