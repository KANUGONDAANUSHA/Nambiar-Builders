import express from "express";
import prisma from "../config/db.js";

const router = express.Router();

function isValidDate(value) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function getCurrentYearDate(dateValue, today) {
  if (!isValidDate(dateValue)) return null;

  const date = new Date(dateValue);
  const currentYearDate = new Date(
    today.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  currentYearDate.setHours(0, 0, 0, 0);
  return currentYearDate;
}

function isSameMonthDay(dateValue, today) {
  const currentYearDate = getCurrentYearDate(dateValue, today);
  if (!currentYearDate) return false;

  const compareDate = new Date(today);
  compareDate.setHours(0, 0, 0, 0);

  return (
    currentYearDate.getMonth() === compareDate.getMonth() &&
    currentYearDate.getDate() === compareDate.getDate()
  );
}

function isInNext7Days(dateValue, today) {
  const currentYearDate = getCurrentYearDate(dateValue, today);
  if (!currentYearDate) return false;

  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  if (currentYearDate < start) {
    currentYearDate.setFullYear(currentYearDate.getFullYear() + 1);
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  return currentYearDate >= start && currentYearDate <= end;
}

function isInThisMonth(dateValue, today) {
  if (!isValidDate(dateValue)) return false;

  const date = new Date(dateValue);
  return date.getMonth() === today.getMonth();
}

router.get("/", async (req, res) => {
  try {
    const today = new Date();

    const [employeesResult, eventsResult, templatesResult, emailLogsResult] =
      await Promise.allSettled([
        prisma.employee.findMany({ orderBy: { id: "desc" } }),
        prisma.event.findMany({ orderBy: { date: "asc" } }),
        prisma.template.findMany({ orderBy: { id: "desc" } }),
        prisma.emailLog.findMany({ orderBy: { createdAt: "desc" } }),
      ]);

    const employees =
      employeesResult.status === "fulfilled" ? employeesResult.value : [];
    const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];
    const templates =
      templatesResult.status === "fulfilled" ? templatesResult.value : [];
    const emailLogs =
      emailLogsResult.status === "fulfilled" ? emailLogsResult.value : [];

    const todayBirthdaysList = employees.filter((emp) =>
      isSameMonthDay(emp.dateOfBirth, today)
    );

    const todayAnniversariesList = employees.filter((emp) =>
      isSameMonthDay(emp.joiningDate, today)
    );

    const todayEventsList = events.filter((event) =>
      isSameMonthDay(event.date, today)
    );

    const thisWeekBirthdays = employees.filter((emp) =>
      isInNext7Days(emp.dateOfBirth, today)
    );

    const thisWeekAnniversaries = employees.filter((emp) =>
      isInNext7Days(emp.joiningDate, today)
    );

    const thisMonthBirthdays = employees.filter((emp) =>
      isInThisMonth(emp.dateOfBirth, today)
    );

    const thisMonthAnniversaries = employees.filter((emp) =>
      isInThisMonth(emp.joiningDate, today)
    );

    const upcomingEvents = events.filter((event) =>
      isInNext7Days(event.date, today)
    );

    const recentEmailLogs = emailLogs.slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees: employees.length,
        totalEvents: events.length,
        totalTemplates: templates.length,
        totalEmailLogs: emailLogs.length,

        todayBirthdays: todayBirthdaysList.length,
        todayAnniversaries: todayAnniversariesList.length,
        todayEvents: todayEventsList.length,
        todayWishes: todayBirthdaysList.length + todayAnniversariesList.length,

        thisWeekBirthdays: thisWeekBirthdays.length,
        thisWeekAnniversaries: thisWeekAnniversaries.length,
        thisWeekWishes:
          thisWeekBirthdays.length + thisWeekAnniversaries.length,

        thisMonthBirthdays: thisMonthBirthdays.length,
        thisMonthAnniversaries: thisMonthAnniversaries.length,
        thisMonthWishes:
          thisMonthBirthdays.length + thisMonthAnniversaries.length,

        birthdayCount: thisMonthBirthdays.length,
        anniversaryCount: thisMonthAnniversaries.length,
        eventCount: events.length,

        todayBirthdaysList,
        todayAnniversariesList,
        todayEventsList,
        upcomingEvents,
        recentEmailLogs,
      },
    });
  } catch (error) {
    console.error("DASHBOARD ROUTE ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to load dashboard data",
    });
  }
});

export default router;