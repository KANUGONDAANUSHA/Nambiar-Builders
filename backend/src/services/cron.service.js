import cron from "node-cron";
import {
  sendAnniversaryEmails,
  sendBirthdayEmails,
  sendEventEmails,
} from "./email.service.js";

export function startCronJobs() {
  cron.schedule("0 9 * * *", async () => {
    console.log("Running birthday email cron job...");
    try {
      const results = await sendBirthdayEmails();
      console.log("Birthday cron completed:", results.length);
    } catch (error) {
      console.error("Birthday cron error:", error.message);
    }
  });

  cron.schedule("5 9 * * *", async () => {
    console.log("Running anniversary email cron job...");
    try {
      const results = await sendAnniversaryEmails();
      console.log("Anniversary cron completed:", results.length);
    } catch (error) {
      console.error("Anniversary cron error:", error.message);
    }
  });

  cron.schedule("10 9 * * *", async () => {
    console.log("Running event email cron job...");
    try {
      const results = await sendEventEmails();
      console.log("Event cron completed:", results.length);
    } catch (error) {
      console.error("Event cron error:", error.message);
    }
  });

  console.log("Cron jobs started");
}