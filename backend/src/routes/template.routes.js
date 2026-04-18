import express from "express";
import prisma from "../config/db.js";

const router = express.Router();

function normalizeText(value) {
  if (value === undefined || value === null) return null;
  return String(value).trim();
}

function parseId(value) {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
}

router.post("/", async (req, res) => {
  try {
    const { name, type, subject, htmlContent } = req.body;

    if (!name || !type || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: "Name, type, subject and htmlContent are required"
      });
    }

    const template = await prisma.template.create({
      data: {
        name: normalizeText(name),
        type: normalizeText(type),
        subject: normalizeText(subject),
        htmlContent: normalizeText(htmlContent)
      }
    });

    return res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: template
    });
  } catch (error) {
    console.error("CREATE TEMPLATE ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create template"
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { id: "desc" }
    });

    return res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error("GET TEMPLATES ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch templates"
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Invalid template id"
      });
    }

    const template = await prisma.template.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: "Template not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error("GET SINGLE TEMPLATE ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch template"
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Invalid template id"
      });
    }

    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        error: "Template not found"
      });
    }

    const { name, type, subject, htmlContent } = req.body;

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        name: name !== undefined ? normalizeText(name) : existingTemplate.name,
        type: type !== undefined ? normalizeText(type) : existingTemplate.type,
        subject:
          subject !== undefined
            ? normalizeText(subject)
            : existingTemplate.subject,
        htmlContent:
          htmlContent !== undefined
            ? normalizeText(htmlContent)
            : existingTemplate.htmlContent
      }
    });

    return res.status(200).json({
      success: true,
      message: "Template updated successfully",
      data: updatedTemplate
    });
  } catch (error) {
    console.error("UPDATE TEMPLATE ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update template"
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Invalid template id"
      });
    }

    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        error: "Template not found"
      });
    }

    await prisma.template.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: "Template deleted successfully"
    });
  } catch (error) {
    console.error("DELETE TEMPLATE ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete template"
    });
  }
});

export default router;