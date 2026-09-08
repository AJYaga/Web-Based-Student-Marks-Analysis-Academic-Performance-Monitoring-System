import type { Response } from "express"

import { prisma } from "../config/prisma.js"
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"

function queryValue(value: unknown) {
  if (typeof value === "string") return value
  if (Array.isArray(value) && typeof value[0] === "string") return value[0]
  return undefined
}

function getGrade(percentage: number) {
  if (percentage >= 75) return "A"
  if (percentage >= 65) return "B"
  if (percentage >= 55) return "C"
  if (percentage >= 40) return "S"
  return "F"
}

type ContextValidationResult =
  | {
      ok: false
      error: string
      status: number
    }
  | {
      ok: true
      selectedClass: {
        id: string
        name: string
        academicYear: number
      }
      examination: {
        id: string
        name: string
      }
      examinationSubject: {
        maxMark: number
        passMark: number
      }
      subject: {
        id: string
        name: string
        code: string
      }
    }

async function validateContext(
  teacherId: string,
  classId: string,
  examinationId: string,
  subjectId: string
): Promise<ContextValidationResult> {
  const selectedClass = await prisma.class.findFirst({
    where: {
      id: classId,
      teacherId,
    },
    select: {
      id: true,
      name: true,
      academicYear: true,
    },
  })

  if (!selectedClass) {
    return {
      ok: false,
      error: "Class not found",
      status: 404,
    }
  }

  const examination = await prisma.examination.findFirst({
    where: {
      id: examinationId,
      teacherId,
      classId,
    },
    select: {
      id: true,
      name: true,
    },
  })

  if (!examination) {
    return {
      ok: false,
      error: "Examination not found for the selected class",
      status: 404,
    }
  }

  const examinationSubject =
    await prisma.examinationSubject.findFirst({
      where: {
        examinationId,
        subjectId,
      },
      select: {
        maxMark: true,
        passMark: true,
      },
    })

  if (!examinationSubject) {
    return {
      ok: false,
      error: "Subject is not included in this examination",
      status: 400,
    }
  }

  const subject = await prisma.subject.findFirst({
    where: {
      id: subjectId,
      teacherId,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  })

  if (!subject) {
    return {
      ok: false,
      error: "Subject not found",
      status: 404,
    }
  }

  return {
    ok: true,
    selectedClass,
    examination,
    examinationSubject,
    subject,
  }
}

export async function getMarksEntry(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId

    const classId = queryValue(req.query.classId)
    const examinationId = queryValue(req.query.examinationId)
    const subjectId = queryValue(req.query.subjectId)

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!classId || !examinationId || !subjectId) {
      return res.status(400).json({
        success: false,
        message:
          "Class, examination and subject are required",
      })
    }

    const context = await validateContext(
      teacherId,
      classId,
      examinationId,
      subjectId
    )

    if (!context.ok) {
        return res.status(context.status).json({
            success: false,
            message: context.error,
        })
    }

    const students = await prisma.student.findMany({
      where: {
        classId,
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    })

    const existingMarks = await prisma.mark.findMany({
      where: {
        examinationId,
        subjectId,
        studentId: {
          in: students.map((student) => student.id),
        },
      },
    })

    const markMap = new Map(
      existingMarks.map((mark) => [
        mark.studentId,
        mark,
      ])
    )

    return res.json({
      success: true,

      context: {
        classId: context.selectedClass.id,
        className: context.selectedClass.name,
        academicYear:
          context.selectedClass.academicYear,

        examinationId: context.examination.id,
        examinationName:
          context.examination.name,

        subjectId: context.subject.id,
        subjectName: context.subject.name,
        subjectCode: context.subject.code,

        maxMark:
          context.examinationSubject.maxMark,

        passMark:
          context.examinationSubject.passMark,
      },

      students: students.map((student) => {
        const mark = markMap.get(student.id)

        return {
          studentId: student.id,
          registrationNo:
            student.registrationNo,
          name: student.name,

          marksObtained:
            mark?.marksObtained ?? null,

          isAbsent:
            mark?.isAbsent ?? false,

          percentage:
            mark?.percentage ?? null,

          grade:
            mark?.grade ?? null,

          passed:
            mark?.passed ?? null,

          status:
            mark?.status ?? null,
        }
      }),
    })
  } catch (error) {
    console.error("Get marks entry error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve marks",
    })
  }
}

export async function saveMarks(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId

    const {
      classId,
      examinationId,
      subjectId,
      marks,
    } = req.body

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (
      !classId ||
      !examinationId ||
      !subjectId ||
      !Array.isArray(marks)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Class, examination, subject and marks are required",
      })
    }

    const context = await validateContext(
      teacherId,
      classId,
      examinationId,
      subjectId
    )

    if (!context.ok) {
        return res.status(context.status).json({
            success: false,
            message: context.error,
        })
    }

    const maxMark =
      context.examinationSubject.maxMark

    const passMark =
      context.examinationSubject.passMark

    const classStudents =
      await prisma.student.findMany({
        where: {
          classId,
          status: "ACTIVE",
        },
        select: {
          id: true,
        },
      })

    const validStudentIds = new Set(
      classStudents.map((student) => student.id)
    )

    for (const item of marks) {
      if (
        !item.studentId ||
        !validStudentIds.has(item.studentId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more students do not belong to the selected class",
        })
      }

      if (item.isAbsent) {
        continue
      }

      if (
        item.marksObtained === null ||
        item.marksObtained === undefined ||
        item.marksObtained === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All present students must have a mark",
        })
      }

      const value = Number(item.marksObtained)

      if (
        Number.isNaN(value) ||
        value < 0 ||
        value > maxMark
      ) {
        return res.status(400).json({
          success: false,
          message: `Marks must be between 0 and ${maxMark}`,
        })
      }
    }

    await prisma.$transaction(
      async (transaction) => {
        for (const item of marks) {
          const isAbsent = Boolean(item.isAbsent)

          let marksObtained: number | null = null
          let percentage: number | null = null
          let grade: string | null = null
          let passed: boolean | null = null

          if (!isAbsent) {
            marksObtained =
              Number(item.marksObtained)

            percentage =
              (marksObtained / maxMark) * 100

            grade = getGrade(percentage)

            passed =
              marksObtained >= passMark
          }

          await transaction.mark.upsert({
            where: {
              studentId_subjectId_examinationId: {
                studentId: item.studentId,
                subjectId,
                examinationId,
              },
            },

            update: {
              marksObtained,
              isAbsent,
              percentage,
              grade,
              passed,
              status: "FINAL",
            },

            create: {
              studentId: item.studentId,
              subjectId,
              examinationId,
              marksObtained,
              isAbsent,
              percentage,
              grade,
              passed,
              status: "FINAL",
            },
          })
        }
      }
    )

    return res.json({
      success: true,
      message: "Marks saved successfully",
    })
  } catch (error) {
    console.error("Save marks error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to save marks",
    })
  }
}