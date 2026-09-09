import type { Response } from "express"

import { prisma } from "../config/prisma.js"
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"

function getParamId(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

async function buildExaminationResponse(examinationId: string) {
  const examination = await prisma.examination.findUnique({
    where: { id: examinationId },
  })

  if (!examination) return null

  const selectedClass = await prisma.class.findUnique({
    where: { id: examination.classId },
  })

  const examinationSubjects =
    await prisma.examinationSubject.findMany({
      where: {
        examinationId,
      },
    })

  const subjects = await Promise.all(
    examinationSubjects.map(async (item) => {
      const subject = await prisma.subject.findUnique({
        where: { id: item.subjectId },
      })

      return subject
        ? {
            id: subject.id,
            code: subject.code,
            name: subject.name,
            maxMark: item.maxMark,
            passMark: item.passMark,
          }
        : null
    })
  )

  return {
    id: examination.id,
    name: examination.name,
    term: examination.term,
    academicYear: examination.academicYear,
    date: formatDate(examination.date),
    status: examination.status,
    classId: examination.classId,
    className: selectedClass?.name ?? "Unknown Class",
    subjects: subjects
      .filter(
        (
          subject
        ): subject is NonNullable<typeof subject> =>
          subject !== null
      )
      .sort((a, b) =>
        a.code.localeCompare(
          b.code,
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          }
        )
      ),
  }
}

export async function getExaminations(
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

    const examinations = await prisma.examination.findMany({
      where: {
        teacherId,
      },
      orderBy: {
        date: "desc",
      },
    })

    const result = await Promise.all(
      examinations.map((item) =>
        buildExaminationResponse(item.id)
      )
    )

    return res.json({
      success: true,
      examinations: result.filter(Boolean),
    })
  } catch (error) {
    console.error("Get examinations error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve examinations",
    })
  }
}

export async function createExamination(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId
    const { name, term, date, classId, subjectIds } = req.body

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (
      !name?.trim() ||
      !term?.trim() ||
      !date ||
      !classId ||
      !Array.isArray(subjectIds) ||
      subjectIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Examination name, date, term, class and at least one subject are required",
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

    const uniqueSubjectIds = [...new Set(subjectIds as string[])]

    const validRelations = await prisma.classSubject.findMany({
      where: {
        classId,
        subjectId: {
          in: uniqueSubjectIds,
        },
      },
    })

    if (validRelations.length !== uniqueSubjectIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected subjects are not assigned to this class",
      })
    }

    const existingExam = await prisma.examination.findFirst({
      where: {
        classId,
        name: name.trim(),
        academicYear: selectedClass.academicYear,
      },
    })

    if (existingExam) {
      return res.status(409).json({
        success: false,
        message:
          "This examination already exists for the selected class and academic year",
      })
    }

    const examination = await prisma.examination.create({
      data: {
        name: name.trim(),
        term: term.trim(),
        date: parseDate(date),
        academicYear: selectedClass.academicYear,
        classId,
        teacherId,
      },
    })

    for (const subjectId of uniqueSubjectIds) {
      const subject = await prisma.subject.findUnique({
        where: {
          id: subjectId,
        },
      })

      if (!subject) continue

      await prisma.examinationSubject.create({
        data: {
          examinationId: examination.id,
          subjectId,
          maxMark: subject.maxMark,
          passMark: 40,
        },
      })
    }

    const result =
      await buildExaminationResponse(examination.id)

    return res.status(201).json({
      success: true,
      message: "Examination created successfully",
      examination: result,
    })
  } catch (error) {
    console.error("Create examination error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to create examination",
    })
  }
}

export async function updateExamination(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId
    const id = getParamId(req.params.id)

    const { name, term, date, classId, subjectIds } = req.body

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Examination ID is required",
      })
    }

    if (
      !name?.trim() ||
      !term?.trim() ||
      !date ||
      !classId ||
      !Array.isArray(subjectIds) ||
      subjectIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Examination name, date, term, class and subjects are required",
      })
    }

    const examination = await prisma.examination.findFirst({
      where: {
        id,
        teacherId,
      },
    })

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
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

    const uniqueSubjectIds = [...new Set(subjectIds as string[])]

    const validRelations = await prisma.classSubject.findMany({
      where: {
        classId,
        subjectId: {
          in: uniqueSubjectIds,
        },
      },
    })

    if (validRelations.length !== uniqueSubjectIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected subjects are not assigned to this class",
      })
    }

    const duplicate = await prisma.examination.findFirst({
      where: {
        classId,
        name: name.trim(),
        academicYear: selectedClass.academicYear,
        NOT: {
          id,
        },
      },
    })

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "This examination already exists for the selected class and academic year",
      })
    }

    const markCount = await prisma.mark.count({
      where: {
        examinationId: id,
      },
    })

    if (markCount > 0) {
      const currentSubjects =
        await prisma.examinationSubject.findMany({
          where: {
            examinationId: id,
          },
        })

      const currentIds = currentSubjects
        .map((item) => item.subjectId)
        .sort()

      const requestedIds = [...uniqueSubjectIds].sort()

      const subjectsChanged =
        JSON.stringify(currentIds) !==
        JSON.stringify(requestedIds)

      if (
        examination.classId !== classId ||
        subjectsChanged
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Class or subjects cannot be changed after marks have been entered",
        })
      }
    }

    await prisma.examination.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        term: term.trim(),
        date: parseDate(date),
        academicYear: selectedClass.academicYear,
        classId,
      },
    })

    if (markCount === 0) {
      await prisma.examinationSubject.deleteMany({
        where: {
          examinationId: id,
        },
      })

      for (const subjectId of uniqueSubjectIds) {
        const subject = await prisma.subject.findUnique({
          where: {
            id: subjectId,
          },
        })

        if (!subject) continue

        await prisma.examinationSubject.create({
          data: {
            examinationId: id,
            subjectId,
            maxMark: subject.maxMark,
            passMark: 40,
          },
        })
      }
    }

    const result = await buildExaminationResponse(id)

    return res.json({
      success: true,
      message: "Examination updated successfully",
      examination: result,
    })
  } catch (error) {
    console.error("Update examination error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to update examination",
    })
  }
}

export async function deleteExamination(
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
        message: "Examination ID is required",
      })
    }

    const examination = await prisma.examination.findFirst({
      where: {
        id,
        teacherId,
      },
    })

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      })
    }

    const markCount = await prisma.mark.count({
      where: {
        examinationId: id,
      },
    })

    if (markCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This examination already contains marks and cannot be deleted",
      })
    }

    await prisma.examinationSubject.deleteMany({
      where: {
        examinationId: id,
      },
    })

    await prisma.examination.delete({
      where: {
        id,
      },
    })

    return res.json({
      success: true,
      message: "Examination deleted successfully",
    })
  } catch (error) {
    console.error("Delete examination error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to delete examination",
    })
  }
}