import type { Response } from "express"

import { prisma } from "../config/prisma.js"
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"

function getParamId(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export async function getClasses(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const classes = await prisma.class.findMany({
      where: {
        teacherId,
      },
      orderBy: [
        {
          academicYear: "desc",
        },
        {
          name: "asc",
        },
      ],
    })

    const classesWithCounts = await Promise.all(
      classes.map(async (item) => {
        const students = await prisma.student.count({
          where: {
            classId: item.id,
          },
        })

        return {
          id: item.id,
          name: item.name,
          level: item.level,
          academicYear: item.academicYear,
          students,
        }
      })
    )

    return res.json({
      success: true,
      classes: classesWithCounts,
    })
  } catch (error) {
    console.error("Get classes error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve classes",
    })
  }
}

export async function createClass(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId
    const { name, level, academicYear } = req.body

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (
      !name?.trim() ||
      !level?.trim() ||
      academicYear === undefined ||
      academicYear === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Class name, level and academic year are required",
      })
    }

    const year = Number(academicYear)

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid academic year",
      })
    }

    const existingClass = await prisma.class.findFirst({
      where: {
        teacherId,
        name: name.trim(),
        academicYear: year,
      },
    })

    if (existingClass) {
      return res.status(409).json({
        success: false,
        message:
          "This class already exists for the selected academic year",
      })
    }

    const createdClass = await prisma.class.create({
      data: {
        name: name.trim(),
        level: level.trim(),
        academicYear: year,
        teacherId,
      },
    })

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      class: {
        id: createdClass.id,
        name: createdClass.name,
        level: createdClass.level,
        academicYear: createdClass.academicYear,
        students: 0,
      },
    })
  } catch (error) {
    console.error("Create class error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to create class",
    })
  }
}

export async function updateClass(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId
    const id = getParamId(req.params.id)

    const { name, level, academicYear } = req.body

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required",
      })
    }

    if (
      !name?.trim() ||
      !level?.trim() ||
      academicYear === undefined ||
      academicYear === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Class name, level and academic year are required",
      })
    }

    const year = Number(academicYear)

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid academic year",
      })
    }

    const existingClass = await prisma.class.findFirst({
      where: {
        id,
        teacherId,
      },
    })

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      })
    }

    const duplicate = await prisma.class.findFirst({
      where: {
        teacherId,
        name: name.trim(),
        academicYear: year,
        NOT: {
          id,
        },
      },
    })

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "This class already exists for the selected academic year",
      })
    }

    const updatedClass = await prisma.class.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        level: level.trim(),
        academicYear: year,
      },
    })

    const students = await prisma.student.count({
      where: {
        classId: id,
      },
    })

    return res.json({
      success: true,
      message: "Class updated successfully",
      class: {
        id: updatedClass.id,
        name: updatedClass.name,
        level: updatedClass.level,
        academicYear: updatedClass.academicYear,
        students,
      },
    })
  } catch (error) {
    console.error("Update class error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to update class",
    })
  }
}

export async function deleteClass(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId
    const id = getParamId(req.params.id)

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required",
      })
    }

    const existingClass = await prisma.class.findFirst({
      where: {
        id,
        teacherId,
      },
    })

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      })
    }

    const studentCount = await prisma.student.count({
      where: {
        classId: id,
      },
    })

    const classSubjectCount = await prisma.classSubject.count({
      where: {
        classId: id,
      },
    })

    const examinationCount = await prisma.examination.count({
      where: {
        classId: id,
      },
    })

    if (
      studentCount > 0 ||
      classSubjectCount > 0 ||
      examinationCount > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This class is already linked to academic records and cannot be deleted",
      })
    }

    await prisma.class.delete({
      where: {
        id,
      },
    })

    return res.json({
      success: true,
      message: "Class deleted successfully",
    })
  } catch (error) {
    console.error("Delete class error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to delete class",
    })
  }
}