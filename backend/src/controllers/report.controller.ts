import type { Response } from "express"

import { prisma } from "../config/prisma.js"
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"

function queryValue(value: unknown) {
  if (typeof value === "string") return value

  if (
    Array.isArray(value) &&
    typeof value[0] === "string"
  ) {
    return value[0]
  }

  return undefined
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function getGrade(percentage: number) {
  if (percentage >= 75) return "A"
  if (percentage >= 65) return "B"
  if (percentage >= 55) return "C"
  if (percentage >= 40) return "S"
  return "F"
}

function getTeacherRemark(
  average: number | null,
  incomplete: boolean
) {
  if (incomplete) {
    return "Some subject results have not been entered yet."
  }

  if (average === null) {
    return "No completed marks are available for this examination."
  }

  if (average >= 75) {
    return "Excellent academic performance. Continue maintaining this high standard."
  }

  if (average >= 65) {
    return "Very good academic performance. Continue the consistent effort."
  }

  if (average >= 55) {
    return "Good academic performance with room for further improvement."
  }

  if (average >= 40) {
    return "Satisfactory performance. Further improvement is encouraged."
  }

  return "Academic performance requires attention and additional support."
}

export async function getStudentReport(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId

    const studentId =
      queryValue(req.query.studentId)

    const examinationId =
      queryValue(req.query.examinationId)

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!studentId || !examinationId) {
      return res.status(400).json({
        success: false,
        message:
          "Student and examination are required",
      })
    }

    const student =
      await prisma.student.findFirst({
        where: {
          id: studentId,
          class: {
            teacherId,
          },
        },

        include: {
          class: {
            select: {
              id: true,
              name: true,
              academicYear: true,
            },
          },
        },
      })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    const examination =
      await prisma.examination.findFirst({
        where: {
          id: examinationId,
          teacherId,
          classId: student.classId,
        },
      })

    if (!examination) {
      return res.status(404).json({
        success: false,
        message:
          "Examination not found for this student's class",
      })
    }

    const examinationSubjects =
      await prisma.examinationSubject.findMany({
        where: {
          examinationId,
        },
      })

    const subjectIds =
      examinationSubjects.map(
        (item) => item.subjectId
      )

    const subjects =
      await prisma.subject.findMany({
        where: {
          id: {
            in: subjectIds,
          },
          teacherId,
        },

        select: {
          id: true,
          code: true,
          name: true,
        },

        orderBy: {
          name: "asc",
        },
      })

    const marks =
      await prisma.mark.findMany({
        where: {
          studentId,
          examinationId,
          subjectId: {
            in: subjectIds,
          },
        },
      })

    const markMap = new Map(
      marks.map((mark) => [
        mark.subjectId,
        mark,
      ])
    )

    const examinationSubjectMap =
      new Map(
        examinationSubjects.map(
          (item) => [
            item.subjectId,
            item,
          ]
        )
      )

    const results = subjects.map(
      (subject) => {
        const mark =
          markMap.get(subject.id)

        const configuration =
          examinationSubjectMap.get(
            subject.id
          )

        return {
          subjectId: subject.id,
          code: subject.code,
          subjectName: subject.name,

          maxMark:
            configuration?.maxMark ??
            100,

          passMark:
            configuration?.passMark ??
            40,

          marksObtained:
            mark?.marksObtained ??
            null,

          isAbsent:
            mark?.isAbsent ??
            false,

          percentage:
            mark?.percentage ??
            null,

          grade:
            mark?.grade ??
            null,

          passed:
            mark?.passed ??
            null,

          entered:
            Boolean(mark),
        }
      }
    )

    const completedPercentages =
      results
        .filter(
          (result) =>
            !result.isAbsent &&
            result.percentage !== null
        )
        .map(
          (result) =>
            result.percentage as number
        )

    const average =
      completedPercentages.length > 0
        ? completedPercentages.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          completedPercentages.length
        : null

    const incomplete =
      results.some(
        (result) =>
          !result.entered
      )

    const hasFailure =
      results.some(
        (result) =>
          result.passed === false
      )

    let overallStatus:
      | "Pass"
      | "Fail"
      | "Incomplete"

    if (incomplete) {
      overallStatus = "Incomplete"
    } else if (hasFailure) {
      overallStatus = "Fail"
    } else {
      overallStatus = "Pass"
    }

    return res.json({
      success: true,

      report: {
        student: {
          id: student.id,
          registrationNo:
            student.registrationNo,
          name: student.name,
          classId:
            student.class.id,
          className:
            student.class.name,
          academicYear:
            student.class.academicYear,
        },

        examination: {
          id: examination.id,
          name: examination.name,
          term: examination.term,
          academicYear:
            examination.academicYear,
          date: examination.date
            .toISOString()
            .slice(0, 10),
        },

        results,

        summary: {
          average:
            average === null
              ? null
              : round(average),

          overallGrade:
            average === null
              ? null
              : getGrade(average),

          status:
            overallStatus,

          teacherRemark:
            getTeacherRemark(
              average,
              incomplete
            ),
        },
      },
    })
  } catch (error) {
    console.error(
      "Student report error:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate student report",
    })
  }
}