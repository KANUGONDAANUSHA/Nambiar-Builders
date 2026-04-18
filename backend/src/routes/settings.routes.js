import express from "express";
import prisma from "../config/db.js";

const router = express.Router();

const defaultSettings = {
  companyName: "Nambiar Builders",
  supportEmail: "support@nambiarbuilders.com",
  senderName: "Nambiar Builders Pvt Ltd",
  birthdayEnabled: true,
  anniversaryEnabled: true,
  welcomeEnabled: true,
  dailyCronTime: "09:00",
  theme: "brown"
};

function normalizeText(value) {
  if (value === undefined || value === null) return null;
  return String(value).trim();
}

function isValidTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value || ""));
}

async function getLatestSettings() {
  return prisma.appSetting.findFirst({
    orderBy: { id: "desc" }
  });
}

router.get("/", async (req, res) => {
  try {
    let settings = await getLatestSettings();

    if (!settings) {
      settings = await prisma.appSetting.create({
        data: defaultSettings
      });
    }

    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch settings"
    });
  }
});

router.put("/", async (req, res) => {
  try {
    const existing = await getLatestSettings();

    if (
      req.body.dailyCronTime !== undefined &&
      !isValidTime(req.body.dailyCronTime)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid daily cron time. Use HH:MM format"
      });
    }

    const payload = {
      companyName:
        req.body.companyName !== undefined
          ? normalizeText(req.body.companyName)
          : existing?.companyName ?? defaultSettings.companyName,
      supportEmail:
        req.body.supportEmail !== undefined
          ? normalizeText(req.body.supportEmail)
          : existing?.supportEmail ?? defaultSettings.supportEmail,
      senderName:
        req.body.senderName !== undefined
          ? normalizeText(req.body.senderName)
          : existing?.senderName ?? defaultSettings.senderName,
      birthdayEnabled:
        typeof req.body.birthdayEnabled === "boolean"
          ? req.body.birthdayEnabled
          : existing?.birthdayEnabled ?? defaultSettings.birthdayEnabled,
      anniversaryEnabled:
        typeof req.body.anniversaryEnabled === "boolean"
          ? req.body.anniversaryEnabled
          : existing?.anniversaryEnabled ?? defaultSettings.anniversaryEnabled,
      welcomeEnabled:
        typeof req.body.welcomeEnabled === "boolean"
          ? req.body.welcomeEnabled
          : existing?.welcomeEnabled ?? defaultSettings.welcomeEnabled,
      dailyCronTime:
        req.body.dailyCronTime !== undefined
          ? String(req.body.dailyCronTime)
          : existing?.dailyCronTime ?? defaultSettings.dailyCronTime,
      theme:
        req.body.theme !== undefined
          ? normalizeText(req.body.theme)
          : existing?.theme ?? defaultSettings.theme
    };

    let settings;

    if (existing) {
      settings = await prisma.appSetting.update({
        where: { id: existing.id },
        data: payload
      });
    } else {
      settings = await prisma.appSetting.create({
        data: payload
      });
    }

    return res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      data: settings
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to save settings"
    });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const existing = await getLatestSettings();

    let settings;

    if (existing) {
      settings = await prisma.appSetting.update({
        where: { id: existing.id },
        data: defaultSettings
      });
    } else {
      settings = await prisma.appSetting.create({
        data: defaultSettings
      });
    }

    return res.status(200).json({
      success: true,
      message: "Settings reset successfully",
      data: settings
    });
  } catch (error) {
    console.error("RESET SETTINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to reset settings"
    });
  }
});

export default router;