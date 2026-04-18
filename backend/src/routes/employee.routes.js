import express from "express";
import prisma from "../config/db.js";

const router = express.Router();

function parseDate(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// CREATE employee
router.post("/", async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      department,
      designation,
      dateOfBirth,
      joiningDate
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Name and email are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingEmail = await prisma.employee.findUnique({
      where: { email: cleanEmail }
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Employee with this email already exists"
      });
    }

    if (employeeId) {
      const existingEmployeeId = await prisma.employee.findFirst({
        where: { employeeId }
      });

      if (existingEmployeeId) {
        return res.status(400).json({
          success: false,
          error: "Employee with this employeeId already exists"
        });
      }
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId: employeeId || null,
        name: name.trim(),
        email: cleanEmail,
        department: department || null,
        designation: designation || null,
        dateOfBirth: parseDate(dateOfBirth),
        joiningDate: parseDate(joiningDate)
      }
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee
    });
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create employee"
    });
  }
});

// GET all employees
router.get("/", async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        id: "desc"
      }
    });

    res.json(employees);
  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch employees"
    });
  }
});

// GET single employee
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid employee id"
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error("GET SINGLE EMPLOYEE ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch employee"
    });
  }
});

// UPDATE employee
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid employee id"
      });
    }

    const {
      employeeId,
      name,
      email,
      department,
      designation,
      dateOfBirth,
      joiningDate
    } = req.body;

    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    if (email && email.trim().toLowerCase() !== existingEmployee.email) {
      const emailExists = await prisma.employee.findUnique({
        where: { email: email.trim().toLowerCase() }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: "Another employee with this email already exists"
        });
      }
    }

    if (employeeId && employeeId !== existingEmployee.employeeId) {
      const employeeIdExists = await prisma.employee.findFirst({
        where: { employeeId }
      });

      if (employeeIdExists) {
        return res.status(400).json({
          success: false,
          error: "Another employee with this employeeId already exists"
        });
      }
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        employeeId:
          employeeId !== undefined ? employeeId || null : existingEmployee.employeeId,
        name: name !== undefined ? name.trim() : existingEmployee.name,
        email:
          email !== undefined
            ? email.trim().toLowerCase()
            : existingEmployee.email,
        department:
          department !== undefined ? department || null : existingEmployee.department,
        designation:
          designation !== undefined
            ? designation || null
            : existingEmployee.designation,
        dateOfBirth:
          dateOfBirth !== undefined
            ? parseDate(dateOfBirth)
            : existingEmployee.dateOfBirth,
        joiningDate:
          joiningDate !== undefined
            ? parseDate(joiningDate)
            : existingEmployee.joiningDate
      }
    });

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee
    });
  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update employee"
    });
  }
});

// DELETE employee
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid employee id"
      });
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    await prisma.employee.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Employee deleted successfully"
    });
  } catch (error) {
    console.error("DELETE EMPLOYEE ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete employee"
    });
  }
});

export default router;