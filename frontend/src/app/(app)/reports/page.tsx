"use client"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Download,
  FileText,
  Loader2,
  Printer,
} from "lucide-react"

import {
  getStudents,
  type StudentRecord,
} from "@/services/students"

import {
  getExaminations,
  type ExaminationRecord,
} from "@/services/examinations"

import {
  getStudentReport,
  type StudentReport,
} from "@/services/reports"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function formatDate(value: string) {
  const [year, month, day] =
    value.split("-").map(Number)

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  )
}

export default function ReportsPage() {
  const [students, setStudents] =
    useState<StudentRecord[]>([])
  
  const [exportingPdf, setExportingPdf] = useState(false)

  const [
    examinations,
    setExaminations,
  ] =
    useState<ExaminationRecord[]>(
      []
    )

  const [studentId, setStudentId] =
    useState("")

  const [
    examinationId,
    setExaminationId,
  ] = useState("")

  const [report, setReport] =
    useState<StudentReport | null>(
      null
    )

  const [loading, setLoading] =
    useState(true)

  const [
    loadingReport,
    setLoadingReport,
  ] = useState(false)

  const [error, setError] =
    useState("")

  const selectedStudent =
    students.find(
      (student) =>
        student.id === studentId
    )

  const availableExaminations =
    useMemo(() => {
      if (!selectedStudent) {
        return []
      }

      return examinations.filter(
        (examination) =>
          examination.classId ===
          selectedStudent.classId
      )
    }, [
      examinations,
      selectedStudent,
    ])

  useEffect(() => {
    let cancelled = false

    async function initialLoad() {
      try {
        const [
          studentResponse,
          examinationResponse,
        ] = await Promise.all([
          getStudents(),
          getExaminations(),
        ])

        if (cancelled) return

        setStudents(
          studentResponse.students
        )

        setExaminations(
          examinationResponse
            .examinations
        )

        const firstStudent =
          studentResponse.students[0]

        if (firstStudent) {
          const firstExam =
            examinationResponse
              .examinations.find(
                (exam) =>
                  exam.classId ===
                  firstStudent.classId
              )

          setStudentId(
            firstStudent.id
          )

          setExaminationId(
            firstExam?.id ?? ""
          )
        }
      } catch (error) {
        if (cancelled) return

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load report setup."
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void initialLoad()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (
      !studentId ||
      !examinationId
    ) {
      return
    }

    let cancelled = false

    async function loadReport() {
      try {
        setLoadingReport(true)

        const response =
          await getStudentReport(
            studentId,
            examinationId
          )

        if (cancelled) return

        setReport(
          response.report
        )

        setError("")
      } catch (error) {
        if (cancelled) return

        setReport(null)

        setError(
          error instanceof Error
            ? error.message
            : "Unable to generate report."
        )
      } finally {
        if (!cancelled) {
          setLoadingReport(false)
        }
      }
    }

    void loadReport()

    return () => {
      cancelled = true
    }
  }, [
    studentId,
    examinationId,
  ])

  function handleStudentChange(
    nextStudentId: string
  ) {
    const nextStudent =
      students.find(
        (student) =>
          student.id ===
          nextStudentId
      )

    const nextExam =
      examinations.find(
        (exam) =>
          exam.classId ===
          nextStudent?.classId
      )

    setStudentId(nextStudentId)

    setExaminationId(
      nextExam?.id ?? ""
    )

    setReport(null)
    setError("")
  }

  function handleExamChange(
    nextExaminationId: string
  ) {
    setExaminationId(
      nextExaminationId
    )

    setReport(null)
    setError("")
  }

  async function handleExportPdf() {
    if (!report) return

    try {
      setExportingPdf(true)
      setError("")

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pageWidth =
        pdf.internal.pageSize.getWidth()

      // Header
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(18)

      pdf.text(
        "EduInsight Academic Report",
        pageWidth / 2,
        18,
        {
          align: "center",
        }
      )

      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.setFontSize(11)

      pdf.text(
        `${report.examination.name} - ${report.examination.term}`,
        pageWidth / 2,
        25,
        {
          align: "center",
        }
      )

      pdf.setFontSize(9)

      pdf.text(
        formatDate(
          report.examination.date
        ),
        pageWidth / 2,
        31,
        {
          align: "center",
        }
      )

      // Student information
      pdf.setFontSize(11)

      pdf.setFont(
        "helvetica",
        "bold"
      )

      pdf.text(
        "Student Information",
        14,
        42
      )

      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.setFontSize(10)

      pdf.text(
        `Student: ${report.student.name}`,
        14,
        49
      )

      pdf.text(
        `Student ID: ${report.student.registrationNo}`,
        14,
        55
      )

      pdf.text(
        `Class: ${report.student.className}`,
        14,
        61
      )

      pdf.text(
        `Academic Year: ${report.student.academicYear}`,
        110,
        49
      )

      // Results table
      autoTable(pdf, {
        startY: 70,

        head: [
          [
            "Subject",
            "Marks",
            "Percentage",
            "Grade",
            "Status",
          ],
        ],

        body: report.results.map(
          (result) => [
            result.subjectName,

            result.isAbsent
              ? "Absent"
              : result.marksObtained ===
                  null
                ? "-"
                : `${result.marksObtained} / ${result.maxMark}`,

            result.isAbsent ||
            result.percentage === null
              ? "-"
              : `${result.percentage.toFixed(
                  1
                )}%`,

            result.grade ?? "-",

            !result.entered
              ? "Not Entered"
              : result.isAbsent
                ? "Absent"
                : result.passed
                  ? "Pass"
                  : "Fail",
          ]
        ),

        styles: {
          font: "helvetica",
          fontSize: 9,
          cellPadding: 3,
        },

        headStyles: {
          fontStyle: "bold",
        },

        margin: {
          left: 14,
          right: 14,
        },
      })

      const tableEndY =
        (
          pdf as jsPDF & {
            lastAutoTable?: {
              finalY: number
            }
          }
        ).lastAutoTable?.finalY ??
        120

      let currentY =
        tableEndY + 10

      // Prevent summary from being clipped
      if (currentY > 240) {
        pdf.addPage()
        currentY = 20
      }

      // Summary
      pdf.setFont(
        "helvetica",
        "bold"
      )

      pdf.setFontSize(11)

      pdf.text(
        "Performance Summary",
        14,
        currentY
      )

      currentY += 8

      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.setFontSize(10)

      const average =
        report.summary.average === null
          ? "-"
          : `${report.summary.average.toFixed(
              1
            )}%`

      pdf.text(
        `Average: ${average}`,
        14,
        currentY
      )

      pdf.text(
        `Overall Grade: ${
          report.summary
            .overallGrade ?? "-"
        }`,
        75,
        currentY
      )

      pdf.text(
        `Status: ${report.summary.status}`,
        145,
        currentY
      )

      currentY += 12

      // Teacher remarks
      pdf.setFont(
        "helvetica",
        "bold"
      )

      pdf.text(
        "Teacher Remarks",
        14,
        currentY
      )

      currentY += 6

      pdf.setFont(
        "helvetica",
        "normal"
      )

      const remarkLines =
        pdf.splitTextToSize(
          report.summary.teacherRemark,
          pageWidth - 28
        )

      pdf.text(
        remarkLines,
        14,
        currentY
      )

      // Footer
      const totalPages =
        pdf.getNumberOfPages()

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pdf.setPage(page)

        const pageHeight =
          pdf.internal.pageSize.getHeight()

        pdf.setFontSize(8)

        pdf.text(
          `Generated by EduInsight | Page ${page} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          {
            align: "center",
          }
        )
      }

      const safeStudentName =
        report.student.name
          .replace(
            /[^a-zA-Z0-9]+/g,
            "_"
          )
          .replace(/^_+|_+$/g, "")

      const safeExamName =
        report.examination.name
          .replace(
            /[^a-zA-Z0-9]+/g,
            "_"
          )
          .replace(/^_+|_+$/g, "")

      pdf.save(
        `${safeStudentName}_${safeExamName}_Report.pdf`
      )
    } catch (error) {
      console.error(
        "PDF export error:",
        error
      )

      setError(
        "Unable to export the report as PDF."
      )
    } finally {
      setExportingPdf(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Loading reports...
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">
          Reports
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Report Card Generation
        </h1>

        <p className="mt-1 text-base text-muted-foreground">
          Preview and prepare student
          academic reports.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <Card className="glass">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Student
            </label>

            <select
              value={studentId}
              onChange={(e) =>
                handleStudentChange(
                  e.target.value
                )
              }
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
            >
              {students.length === 0 ? (
                <option value="">
                  No students
                </option>
              ) : (
                students.map(
                  (student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.name} —{" "}
                      {
                        student.registrationNo
                      }
                    </option>
                  )
                )
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Examination
            </label>

            <select
              value={examinationId}
              onChange={(e) =>
                handleExamChange(
                  e.target.value
                )
              }
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
              disabled={
                availableExaminations.length ===
                0
              }
            >
              {availableExaminations.length ===
              0 ? (
                <option value="">
                  No examinations
                </option>
              ) : (
                availableExaminations.map(
                  (exam) => (
                    <option
                      key={exam.id}
                      value={exam.id}
                    >
                      {exam.name}
                    </option>
                  )
                )
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      {loadingReport ? (
        <div className="flex min-h-80 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Generating report...
        </div>
      ) : !report ? (
        <Card className="glass">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Select a student and
            examination to generate a
            report.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card
            id="academic-report"
            className="glass-strong mx-auto max-w-4xl"
          >
            <CardHeader className="border-b text-center">
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-6" />
              </div>

              <CardTitle className="text-2xl">
                EduInsight Academic Report
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                {
                  report.examination
                    .name
                }{" "}
                •{" "}
                {
                  report.examination
                    .term
                }
              </p>

              <p className="text-xs text-muted-foreground">
                {formatDate(
                  report.examination
                    .date
                )}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 rounded-xl bg-muted/40 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Student
                  </p>

                  <p className="font-semibold">
                    {
                      report.student
                        .name
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Student ID
                  </p>

                  <p className="font-semibold">
                    {
                      report.student
                        .registrationNo
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Class
                  </p>

                  <p className="font-semibold">
                    {
                      report.student
                        .className
                    }
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        Subject
                      </th>

                      <th className="px-4 py-3 text-left">
                        Marks
                      </th>

                      <th className="px-4 py-3 text-left">
                        Percentage
                      </th>

                      <th className="px-4 py-3 text-left">
                        Grade
                      </th>

                      <th className="px-4 py-3 text-left">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {report.results.map(
                      (result) => (
                        <tr
                          key={
                            result.subjectId
                          }
                        >
                          <td className="px-4 py-3 font-medium">
                            {
                              result.subjectName
                            }
                          </td>

                          <td className="px-4 py-3">
                            {result.isAbsent
                              ? "Absent"
                              : result.marksObtained ===
                                  null
                                ? "-"
                                : `${result.marksObtained} / ${result.maxMark}`}
                          </td>

                          <td className="px-4 py-3">
                            {result.isAbsent
                              ? "-"
                              : result.percentage ===
                                  null
                                ? "-"
                                : `${result.percentage.toFixed(
                                    1
                                  )}%`}
                          </td>

                          <td className="px-4 py-3">
                            {
                              result.grade ??
                              "-"
                            }
                          </td>

                          <td className="px-4 py-3">
                            {!result.entered
                              ? "Not Entered"
                              : result.isAbsent
                                ? "Absent"
                                : result.passed
                                  ? "Pass"
                                  : "Fail"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Average
                  </p>

                  <p className="text-2xl font-semibold">
                    {report.summary
                      .average === null
                      ? "-"
                      : `${report.summary.average.toFixed(
                          1
                        )}%`}
                  </p>
                </div>

                <div className="rounded-xl border p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Overall Grade
                  </p>

                  <p className="text-2xl font-semibold">
                    {
                      report.summary
                        .overallGrade ??
                      "-"
                    }
                  </p>
                </div>

                <div className="rounded-xl border p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Status
                  </p>

                  <p
                    className={
                      report.summary
                        .status ===
                      "Fail"
                        ? "text-2xl font-semibold text-destructive"
                        : "text-2xl font-semibold"
                    }
                  >
                    {
                      report.summary
                        .status
                    }
                  </p>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm font-semibold">
                  Teacher Remarks
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  {
                    report.summary
                      .teacherRemark
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                window.print()
              }
            >
              <Printer className="size-4" />
              Print
            </Button>

            <Button
              className="gap-2"
              onClick={handleExportPdf}
              disabled={exportingPdf}
            >
              {exportingPdf ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}

              {exportingPdf
                ? "Exporting..."
                : "Export PDF"}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Reports can be printed or exported
            directly as PDF.
          </p>
        </>
      )}
    </div>
  )
}