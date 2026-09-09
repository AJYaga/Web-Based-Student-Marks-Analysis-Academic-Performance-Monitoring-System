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

function average(values: number[]) {
  if (values.length === 0) return null

  return (
    values.reduce(
      (total, value) => total + value,
      0
    ) / values.length
  )
}

function getGrade(percentage: number) {
  if (percentage >= 75) return "A"
  if (percentage >= 65) return "B"
  if (percentage >= 55) return "C"
  if (percentage >= 40) return "S"
  return "F"
}

export async function getAnalytics(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId =
      req.teacher?.teacherId

    const classId =
      queryValue(req.query.classId)

    const examinationId =
      queryValue(
        req.query.examinationId
      )

    const subjectId =
      queryValue(req.query.subjectId)

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      })
    }

    if (
      !classId ||
      !examinationId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Class and examination are required",
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
        message: "Class not found",
      })
    }

    const selectedExamination =
      await prisma.examination.findFirst({
        where: {
          id: examinationId,
          classId,
          teacherId,
        },
      })

    if (!selectedExamination) {
      return res.status(404).json({
        success: false,
        message:
          "Examination not found",
      })
    }

    let selectedSubject:
      | {
          id: string
          code: string
          name: string
        }
      | null = null

    if (
      subjectId &&
      subjectId !== "all"
    ) {
      const examinationSubject =
        await prisma.examinationSubject.findFirst(
          {
            where: {
              examinationId,
              subjectId,
            },
          }
        )

      if (!examinationSubject) {
        return res.status(400).json({
          success: false,
          message:
            "Subject is not included in this examination",
        })
      }

      selectedSubject =
        await prisma.subject.findFirst({
          where: {
            id: subjectId,
            teacherId,
          },
          select: {
            id: true,
            code: true,
            name: true,
          },
        })

      if (!selectedSubject) {
        return res.status(404).json({
          success: false,
          message:
            "Subject not found",
        })
      }
    }

    const students =
      await prisma.student.findMany({
        where: {
          classId,
          status: "ACTIVE",
        },
        select: {
          id: true,
          registrationNo: true,
          name: true,
        },
        orderBy: {
          registrationNo: "asc",
        },
      })

    const studentIds =
      students.map(
        (student) => student.id
      )

    const currentMarks =
      await prisma.mark.findMany({
        where: {
          examinationId,
          studentId: {
            in: studentIds,
          },
          isAbsent: false,
          percentage: {
            not: null,
          },
          ...(selectedSubject
            ? {
                subjectId:
                  selectedSubject.id,
              }
            : {}),
        },
        select: {
          studentId: true,
          subjectId: true,
          percentage: true,
          passed: true,
          grade: true,
        },
      })

    const previousExamination =
      await prisma.examination.findFirst({
        where: {
          teacherId,
          classId,
          date: {
            lt: selectedExamination.date,
          },
        },
        orderBy: {
          date: "desc",
        },
      })

    const previousMarks =
      previousExamination
        ? await prisma.mark.findMany({
            where: {
              examinationId:
                previousExamination.id,

              studentId: {
                in: studentIds,
              },

              isAbsent: false,

              percentage: {
                not: null,
              },

              ...(selectedSubject
                ? {
                    subjectId:
                      selectedSubject.id,
                  }
                : {}),
            },

            select: {
              studentId: true,
              percentage: true,
            },
          })
        : []

    const currentPercentages =
      currentMarks
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

    const classAverage =
      average(currentPercentages) ??
      0

    const passResults =
      currentMarks.filter(
        (mark) =>
          mark.passed !== null
      )

    const passedCount =
      passResults.filter(
        (mark) =>
          mark.passed === true
      ).length

    const passRate =
      passResults.length > 0
        ? (passedCount /
            passResults.length) *
          100
        : 0

    const studentCurrentMap =
      new Map<string, number[]>()

    for (const mark of currentMarks) {
      if (
        mark.percentage === null
      ) {
        continue
      }

      const values =
        studentCurrentMap.get(
          mark.studentId
        ) ?? []

      values.push(mark.percentage)

      studentCurrentMap.set(
        mark.studentId,
        values
      )
    }

    const studentPreviousMap =
      new Map<string, number[]>()

    for (const mark of previousMarks) {
      if (
        mark.percentage === null
      ) {
        continue
      }

      const values =
        studentPreviousMap.get(
          mark.studentId
        ) ?? []

      values.push(mark.percentage)

      studentPreviousMap.set(
        mark.studentId,
        values
      )
    }

    const studentResults =
      students
        .map((student) => {
          const currentAverage =
            average(
              studentCurrentMap.get(
                student.id
              ) ?? []
            )

          const previousAverage =
            average(
              studentPreviousMap.get(
                student.id
              ) ?? []
            )

          let trend:
            | "Improving"
            | "Declining"
            | "Stable" =
            "Stable"

          if (
            currentAverage !== null &&
            previousAverage !== null
          ) {
            const difference =
              currentAverage -
              previousAverage

            if (difference > 1) {
              trend = "Improving"
            } else if (
              difference < -1
            ) {
              trend = "Declining"
            }
          }

          return {
            id: student.id,
            registrationNo:
              student.registrationNo,
            name: student.name,
            average:
              currentAverage,
            trend,
          }
        })
        .filter(
          (student) =>
            student.average !== null
        )

    const highestAverage =
      studentResults.length > 0
        ? Math.max(
            ...studentResults.map(
              (student) =>
                student.average ?? 0
            )
          )
        : 0

    const weakStudents =
      studentResults
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
        .map((student) => ({
          id: student.id,
          registrationNo:
            student.registrationNo,
          name: student.name,
          average: round(
            student.average ?? 0
          ),
          trend: student.trend,
        }))

    const examinationSubjects =
      await prisma.examinationSubject.findMany(
        {
          where: {
            examinationId,
          },
        }
      )

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
          code: "asc",
        },
      })

    const subjectPerformance =
      subjects
        .filter(
          (subject) =>
            !selectedSubject ||
            subject.id ===
              selectedSubject.id
        )
        .map((subject) => {
          const percentages =
            currentMarks
              .filter(
                (mark) =>
                  mark.subjectId ===
                  subject.id
              )
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

          return {
            id: subject.id,
            code: subject.code,
            subject: subject.name,
            average:
              round(
                average(percentages) ??
                  0
              ),
          }
        })

    const gradeCounts = {
      A: 0,
      B: 0,
      C: 0,
      S: 0,
      F: 0,
    }

    for (const percentage of currentPercentages) {
      const grade =
        getGrade(percentage)

      gradeCounts[grade] += 1
    }

    const totalGraded =
      Object.values(
        gradeCounts
      ).reduce(
        (sum, count) =>
          sum + count,
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

    return res.json({
      success: true,

      context: {
        classId:
          selectedClass.id,
        className:
          selectedClass.name,

        examinationId:
          selectedExamination.id,

        examinationName:
          selectedExamination.name,

        previousExaminationName:
          previousExamination?.name ??
          null,

        subjectId:
          selectedSubject?.id ??
          "all",

        subjectName:
          selectedSubject?.name ??
          "All Subjects",
      },

      summary: {
        classAverage:
          round(classAverage),

        passRate:
          round(passRate),

        highestAverage:
          round(highestAverage),

        needsAttention:
          weakStudents.length,
      },

      subjectPerformance,
      gradeDistribution,
      weakStudents,
    })
  } catch (error) {
    console.error(
      "Analytics error:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve analytics",
    })
  }
}