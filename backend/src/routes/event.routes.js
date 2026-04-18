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

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

router.post("/", async (req, res) => {
  try {
    const { title, date, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        error: "Title and date are required"
      });
    }

    const parsedDate = parseDate(date);

    if (!parsedDate) {
      return res.status(400).json({
        success: false,
        error: "Invalid event date"
      });
    }

    const event = await prisma.event.create({
      data: {
        title: normalizeText(title),
        date: parsedDate,
        description: normalizeText(description)
      }
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event
    });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create event"
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" }
    });

    return res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch events"
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Invalid event id"
      });
    }

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error("GET SINGLE EVENT ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch event"
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Invalid event id"
      });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: "Event not found"
      });
    }

    const { title, date, description } = req.body;

    let parsedDate = existingEvent.date;

    if (date !== undefined) {
      const convertedDate = parseDate(date);

      if (!convertedDate) {
        return res.status(400).json({
          success: false,
          error: "Invalid event date"
        });
      }

      parsedDate = convertedDate;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: title !== undefined ? normalizeText(title) : existingEvent.title,
        date: parsedDate,
        description:
          description !== undefined
            ? normalizeText(description)
            : existingEvent.description
      }
    });

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent
    });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update event"
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Invalid event id"
      });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: "Event not found"
      });
    }

    await prisma.event.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete event"
    });
  }
});

export default router;