import type { Response } from "express"

import { prisma } from "../config/prisma.js"
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"

function getParamId(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

async function calculateStudentAverage(studentId: string) {
  const marks = await prisma.mark.findMany({
    where: {
      studentId,
      isAbsent: false,
      percentage: {
        not: null,
      },
    },
    select: {
      percentage: true,
    },
  })

  const validMarks = marks
    .map((item) => item.percentage)
    .filter((value): value is number => value !== null)

  if (validMarks.length === 0) {
    return null
  }

  return (
    validMarks.reduce((total, value) => total + value, 0) /
    validMarks.length
  )
}

export async function getStudents(
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

    const students = await prisma.student.findMany({
      where: {
        class: {
          teacherId,
        },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            level: true,
            academicYear: true,
          },
        },
      },
      orderBy: {
        registrationNo: "asc",
      },
    })

    const studentsWithPerformance = await Promise.all(
      students.map(async (student) => {
        const average = await calculateStudentAverage(student.id)

        return {
          id: student.id,
          registrationNo: student.registrationNo,
          name: student.name,
          status: student.status,
          classId: student.classId,
          className: student.class.name,
          academicYear: student.class.academicYear,
          average,
          needsAttention:
            average !== null &&
            average < 40 &&
            student.status === "ACTIVE",
        }
      })
    )

    return res.json({
      success: true,
      students: studentsWithPerformance,
    })
  } catch (error) {
    console.error("Get students error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve students",
    })
  }
}

export async function createStudent(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId
    const { registrationNo, name, classId } = req.body

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (
      !registrationNo?.trim() ||
      !name?.trim() ||
      !classId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student ID, student name and class are required",
      })
    }

    const selectedClass = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId,
      },
    })

    if (!selectedClass) {
      return res.status(404).json({
        success: false,
        message: "Selected class was not found",
      })
    }

    const existingStudent = await prisma.student.findFirst({
      where: {
        classId,
        registrationNo: registrationNo.trim(),
      },
    })

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message:
          "A student with this ID already exists in the selected class",
      })
    }

    const student = await prisma.student.create({
      data: {
        registrationNo: registrationNo.trim(),
        name: name.trim(),
        classId,
      },
    })

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      student: {
        id: student.id,
        registrationNo: student.registrationNo,
        name: student.name,
        status: student.status,
        classId: student.classId,
        className: selectedClass.name,
        academicYear: selectedClass.academicYear,
        average: null,
        needsAttention: false,
      },
    })
  } catch (error) {
    console.error("Create student error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to create student",
    })
  }
}

export async function updateStudent(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId
    const id = getParamId(req.params.id)

    const {
      registrationNo,
      name,
      classId,
    } = req.body

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      })
    }

    if (
      !registrationNo?.trim() ||
      !name?.trim() ||
      !classId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student ID, student name and class are required",
      })
    }

    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        class: {
          teacherId,
        },
      },
    })

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    const selectedClass = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId,
      },
    })

    if (!selectedClass) {
      return res.status(404).json({
        success: false,
        message: "Selected class was not found",
      })
    }

    const duplicate = await prisma.student.findFirst({
      where: {
        classId,
        registrationNo: registrationNo.trim(),
        NOT: {
          id,
        },
      },
    })

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "A student with this ID already exists in the selected class",
      })
    }

    const student = await prisma.student.update({
      where: {
        id,
      },
      data: {
        registrationNo: registrationNo.trim(),
        name: name.trim(),
        classId,
      },
    })

    const average = await calculateStudentAverage(student.id)

    return res.json({
      success: true,
      message: "Student updated successfully",
      student: {
        id: student.id,
        registrationNo: student.registrationNo,
        name: student.name,
        status: student.status,
        classId: student.classId,
        className: selectedClass.name,
        academicYear: selectedClass.academicYear,
        average,
        needsAttention:
          average !== null &&
          average < 40 &&
          student.status === "ACTIVE",
      },
    })
  } catch (error) {
    console.error("Update student error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to update student",
    })
  }
}

export async function deleteStudent(
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
        message: "Student ID is required",
      })
    }

    const student = await prisma.student.findFirst({
      where: {
        id,
        class: {
          teacherId,
        },
      },
    })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    const markCount = await prisma.mark.count({
      where: {
        studentId: id,
      },
    })

    if (markCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This student already has examination marks and cannot be deleted",
      })
    }

    await prisma.student.delete({
      where: {
        id,
      },
    })

    return res.json({
      success: true,
      message: "Student deleted successfully",
    })
  } catch (error) {
    console.error("Delete student error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to delete student",
    })
  }
}