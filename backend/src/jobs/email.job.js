import cron from "node-cron";
import prisma from "../config/db.js";
import { sendMail } from "../utils/mailer.js";

function isToday(dateValue) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function startEmailCron() {
  cron.schedule("0 9 * * *", async () => {
    try {
      const settings = await prisma.appSetting.findFirst({
        orderBy: { id: "desc" }
      });

      const employees = await prisma.employee.findMany();

      for (const emp of employees) {
        if (settings?.birthdayEnabled && isToday(emp.dateOfBirth)) {
          const subject = `Happy Birthday ${emp.name}`;
          const html = `
            <div style="font-family: Arial, sans-serif;">
              <h2>Happy Birthday ${emp.name}</h2>
              <p>Wishing you a wonderful year ahead.</p>
            </div>
          `;

          const result = await sendMail({
            to: emp.email,
            subject,
            html
          });

          await prisma.emailLog.create({
            data: {
              recipient: emp.email,
              subject,
              type: "birthday",
              status: result.success ? "sent" : "failed",
              message: result.message,
              employeeId: emp.id
            }
          });
        }

        if (settings?.anniversaryEnabled && isToday(emp.joiningDate)) {
          const subject = `Happy Work Anniversary ${emp.name}`;
          const html = `
            <div style="font-family: Arial, sans-serif;">
              <h2>Happy Work Anniversary ${emp.name}</h2>
              <p>Thank you for being part of Nambiar Builders.</p>
            </div>
          `;

          const result = await sendMail({
            to: emp.email,
            subject,
            html
          });

          await prisma.emailLog.create({
            data: {
              recipient: emp.email,
              subject,
              type: "anniversary",
              status: result.success ? "sent" : "failed",
              message: result.message,
              employeeId: emp.id
            }
          });
        }
      }
    } catch (error) {
      console.error("EMAIL CRON ERROR:", error.message);
    }
  });
}