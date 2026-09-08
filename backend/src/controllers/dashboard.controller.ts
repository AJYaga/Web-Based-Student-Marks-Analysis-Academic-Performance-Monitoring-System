import type { Response } from "express"

import { prisma } from "../config/prisma.js"
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"

function round(value: number, digits = 1) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export async function getDashboard(
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
      select: {
        id: true,
      },
    })

    const classIds = classes.map((item) => item.id)

    const [
      totalStudents,
      totalSubjects,
      totalExaminations,
      marks,
      students,
      examinations,
    ] = await Promise.all([
      prisma.student.count({
        where: {
          classId: {
            in: classIds,
          },
          status: "ACTIVE",
        },
      }),

      prisma.subject.count({
        where: {
          teacherId,
          status: "ACTIVE",
        },
      }),

      prisma.examination.count({
        where: {
          teacherId,
        },
      }),

      prisma.mark.findMany({
        where: {
          student: {
            class: {
              teacherId,
            },
          },
          isAbsent: false,
          percentage: {
            not: null,
          },
        },
        select: {
          percentage: true,
          passed: true,
          grade: true,
          examinationId: true,
          studentId: true,
        },
      }),

      prisma.student.findMany({
        where: {
          class: {
            teacherId,
          },
          status: "ACTIVE",
        },
        select: {
          id: true,
          registrationNo: true,
          name: true,
        },
      }),

      prisma.examination.findMany({
        where: {
          teacherId,
        },
        orderBy: {
          date: "asc",
        },
        select: {
          id: true,
          name: true,
          term: true,
          date: true,
        },
      }),
    ])

    const validPercentages = marks
      .map((item) => item.percentage)
      .filter((value): value is number => value !== null)

    const overallAverage =
      validPercentages.length > 0
        ? validPercentages.reduce(
            (sum, value) => sum + value,
            0
          ) / validPercentages.length
        : 0

    const marksWithPassResult = marks.filter(
      (item) => item.passed !== null
    )

    const passedMarks = marksWithPassResult.filter(
      (item) => item.passed === true
    ).length

    const passRate =
      marksWithPassResult.length > 0
        ? (passedMarks / marksWithPassResult.length) * 100
        : 0

    const studentMarksMap = new Map<string, number[]>()

    for (const mark of marks) {
      if (mark.percentage === null) continue

      const existing =
        studentMarksMap.get(mark.studentId) ?? []

      existing.push(mark.percentage)

      studentMarksMap.set(
        mark.studentId,
        existing
      )
    }

    const studentsWithAverage = students.map(
      (student) => {
        const percentages =
          studentMarksMap.get(student.id) ?? []

        const average =
          percentages.length > 0
            ? percentages.reduce(
                (sum, value) => sum + value,
                0
              ) / percentages.length
            : null

        return {
          id: student.id,
          registrationNo:
            student.registrationNo,
          name: student.name,
          average,
        }
      }
    )

    const studentsNeedingAttention =
      studentsWithAverage
        .filter(
          (student) =>
            student.average !== null &&
            student.average < 40
        )
        .sort(
          (a, b) =>
            (a.average ?? 0) -
            (b.average ?? 0)
        )
        .slice(0, 5)
        .map((student) => ({
          id: student.id,
          registrationNo:
            student.registrationNo,
          name: student.name,
          average: round(
            student.average ?? 0
          ),
        }))

    const gradeCounts = {
      A: 0,
      B: 0,
      C: 0,
      S: 0,
      F: 0,
    }

    for (const mark of marks) {
      if (
        mark.grade &&
        mark.grade in gradeCounts
      ) {
        gradeCounts[
          mark.grade as keyof typeof gradeCounts
        ] += 1
      }
    }

    const totalGraded =
      Object.values(
        gradeCounts
      ).reduce(
        (sum, value) =>
          sum + value,
        0
      )

    const gradeDistribution =
      Object.entries(
        gradeCounts
      ).map(([grade, count]) => ({
        grade,
        value:
          totalGraded > 0
            ? round(
                (count /
                  totalGraded) *
                  100
              )
            : 0,
      }))

    const examinationTrend =
      examinations
        .map((examination) => {
          const examinationMarks =
            marks.filter(
              (mark) =>
                mark.examinationId ===
                examination.id &&
                mark.percentage !== null
            )

          const percentages =
            examinationMarks
              .map(
                (mark) =>
                  mark.percentage
              )
              .filter(
                (
                  value
                ): value is number =>
                  value !== null
              )

          const average =
            percentages.length > 0
              ? percentages.reduce(
                  (sum, value) =>
                    sum + value,
                  0
                ) /
                percentages.length
              : null

          return {
            id: examination.id,
            name: examination.name,
            term: examination.term,
            date: examination.date
              .toISOString()
              .slice(0, 10),
            average:
              average === null
                ? null
                : round(average),
          }
        })
        .filter(
          (item) =>
            item.average !== null
        )
        .slice(-5)

    return res.json({
      success: true,

      summary: {
        totalClasses: classes.length,
        totalStudents,
        totalSubjects,
        totalExaminations,
        overallAverage:
          round(overallAverage),
        passRate:
          round(passRate),
        needsAttention:
          studentsNeedingAttention.length,
      },

      studentsNeedingAttention,

      gradeDistribution,

      performanceTrend:
        examinationTrend,
    })
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve dashboard data",
    })
  }
}