import type { Response } from "express"

import { prisma } from "../config/prisma.js"
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"

function getParamId(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

async function getSubjectClass(subjectId: string) {
  const relation = await prisma.classSubject.findFirst({
    where: {
      subjectId,
    },
  })

  if (!relation) {
    return null
  }

  return prisma.class.findUnique({
    where: {
      id: relation.classId,
    },
  })
}

export async function getSubjects(
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

    const subjects = await prisma.subject.findMany({
      where: {
        teacherId,
      },
      orderBy: {
        name: "asc",
      },
    })

    const result = await Promise.all(
      subjects.map(async (subject) => {
        const assignedClass =
          await getSubjectClass(subject.id)

        return {
          id: subject.id,
          code: subject.code,
          name: subject.name,
          maxMark: subject.maxMark,
          status: subject.status,
          classId: assignedClass?.id ?? null,
          className: assignedClass?.name ?? "Not assigned",
          academicYear:
            assignedClass?.academicYear ?? null,
        }
      })
    )

    return res.json({
      success: true,
      subjects: result,
    })
  } catch (error) {
    console.error("Get subjects error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve subjects",
    })
  }
}

export async function createSubject(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId

    const {
      code,
      name,
      maxMark,
      classId,
    } = req.body

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (
      !code?.trim() ||
      !name?.trim() ||
      !classId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Subject code, subject name and class are required",
      })
    }

    const maximum = Number(maxMark)

    if (
      !Number.isInteger(maximum) ||
      maximum <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Maximum mark must be a positive number",
      })
    }

    const selectedClass =
      await prisma.class.findFirst({
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

    const duplicate =
      await prisma.subject.findFirst({
        where: {
          teacherId,
          code: code.trim().toUpperCase(),
        },
      })

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "A subject with this code already exists",
      })
    }

    const subject =
      await prisma.subject.create({
        data: {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          maxMark: maximum,
          teacherId,
        },
      })

    await prisma.classSubject.create({
      data: {
        classId,
        subjectId: subject.id,
      },
    })

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      subject: {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        maxMark: subject.maxMark,
        status: subject.status,
        classId: selectedClass.id,
        className: selectedClass.name,
        academicYear:
          selectedClass.academicYear,
      },
    })
  } catch (error) {
    console.error("Create subject error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to create subject",
    })
  }
}

export async function updateSubject(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId
    const id = getParamId(req.params.id)

    const {
      code,
      name,
      maxMark,
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
        message: "Subject ID is required",
      })
    }

    if (
      !code?.trim() ||
      !name?.trim() ||
      !classId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Subject code, subject name and class are required",
      })
    }

    const maximum = Number(maxMark)

    if (
      !Number.isInteger(maximum) ||
      maximum <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Maximum mark must be a positive number",
      })
    }

    const existingSubject =
      await prisma.subject.findFirst({
        where: {
          id,
          teacherId,
        },
      })

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      })
    }

    const selectedClass =
      await prisma.class.findFirst({
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

    const duplicate =
      await prisma.subject.findFirst({
        where: {
          teacherId,
          code: code.trim().toUpperCase(),
          NOT: {
            id,
          },
        },
      })

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "A subject with this code already exists",
      })
    }

    const subject =
      await prisma.subject.update({
        where: {
          id,
        },
        data: {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          maxMark: maximum,
        },
      })

    await prisma.classSubject.deleteMany({
      where: {
        subjectId: id,
      },
    })

    await prisma.classSubject.create({
      data: {
        subjectId: id,
        classId,
      },
    })

    return res.json({
      success: true,
      message: "Subject updated successfully",
      subject: {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        maxMark: subject.maxMark,
        status: subject.status,
        classId: selectedClass.id,
        className: selectedClass.name,
        academicYear:
          selectedClass.academicYear,
      },
    })
  } catch (error) {
    console.error("Update subject error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to update subject",
    })
  }
}

export async function deleteSubject(
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
        message: "Subject ID is required",
      })
    }

    const subject =
      await prisma.subject.findFirst({
        where: {
          id,
          teacherId,
        },
      })

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      })
    }

    const markCount = await prisma.mark.count({
      where: {
        subjectId: id,
      },
    })

    const examinationCount =
      await prisma.examinationSubject.count({
        where: {
          subjectId: id,
        },
      })

    if (
      markCount > 0 ||
      examinationCount > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This subject is already linked to examination records and cannot be deleted",
      })
    }

    await prisma.classSubject.deleteMany({
      where: {
        subjectId: id,
      },
    })

    await prisma.subject.delete({
      where: {
        id,
      },
    })

    return res.json({
      success: true,
      message: "Subject deleted successfully",
    })
  } catch (error) {
    console.error("Delete subject error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to delete subject",
    })
  }
}