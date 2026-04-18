import nodemailer from "nodemailer";

export function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS missing in .env");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
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

    return {
      success: false,
      message: error.message,
    };
  }
}

export async function sendMail({ to, subject, html }) {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"Nambiar Builders" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("MAIL ERROR:", error);

    return {
      success: false,
      message: error.message,
    };
  }
}