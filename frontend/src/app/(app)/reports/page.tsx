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
  const [printingPdf, setPrintingPdf] = useState(false)

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

  function buildReportPdf() {
    if (!report) return
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pageWidth =
        pdf.internal.pageSize.getWidth()

      const pageHeight =
        pdf.internal.pageSize.getHeight()

      const marginX = 18
      const contentWidth =
        pageWidth - marginX * 2

      // -----------------------------
      // Helper functions
      // -----------------------------

      function drawRoundedCard(
        x: number,
        y: number,
        width: number,
        height: number,
        fill: [
          number,
          number,
          number,
        ] = [248, 250, 252]
      ) {
        pdf.setFillColor(
          fill[0],
          fill[1],
          fill[2]
        )

        pdf.setDrawColor(
          215,
          224,
          234
        )

        pdf.setLineWidth(0.35)

        pdf.roundedRect(
          x,
          y,
          width,
          height,
          3,
          3,
          "FD"
        )
      }

      function ensureSpace(
        requiredHeight: number,
        currentY: number
      ) {
        if (
          currentY +
            requiredHeight >
          240
        ) {
          pdf.addPage()
          return 20
        }

        return currentY
      }

      // -----------------------------
      // Report header
      // -----------------------------

      let currentY = 22

      pdf.setTextColor(
        15,
        23,
        42
      )

      pdf.setFont(
        "helvetica",
        "bold"
      )

      pdf.setFontSize(18)

      pdf.text(
        "EduInsight Academic Report",
        pageWidth / 2,
        currentY,
        {
          align: "center",
        }
      )

      currentY += 8

      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.setFontSize(10)

      pdf.setTextColor(
        71,
        85,
        105
      )

      pdf.text(
        `${report.examination.name} • ${report.examination.term}`,
        pageWidth / 2,
        currentY,
        {
          align: "center",
        }
      )

      currentY += 6

      pdf.setFontSize(9)

      pdf.text(
        formatDate(
          report.examination.date
        ),
        pageWidth / 2,
        currentY,
        {
          align: "center",
        }
      )

      currentY += 10

      // Divider below report header
      pdf.setDrawColor(
        220,
        228,
        236
      )

      pdf.line(
        marginX,
        currentY,
        pageWidth - marginX,
        currentY
      )

      currentY += 10

      // -----------------------------
      // Student information card
      // -----------------------------

      const studentCardHeight = 22

      drawRoundedCard(
        marginX,
        currentY,
        contentWidth,
        studentCardHeight,
        [245, 248, 252]
      )

      const studentColumns = [
        {
          label: "Student",
          value:
            report.student.name,
        },
        {
          label: "Student ID",
          value:
            report.student
              .registrationNo,
        },
        {
          label: "Class",
          value:
            report.student
              .className,
        },
      ]

      const columnWidth =
        contentWidth / 3

      studentColumns.forEach(
        (item, index) => {
          const x =
            marginX +
            index *
              columnWidth +
            5

          pdf.setFont(
            "helvetica",
            "normal"
          )

          pdf.setFontSize(8)

          pdf.setTextColor(
            100,
            116,
            139
          )

          pdf.text(
            item.label,
            x,
            currentY + 8
          )

          pdf.setFont(
            "helvetica",
            "bold"
          )

          pdf.setFontSize(10)

          pdf.setTextColor(
            15,
            23,
            42
          )

          pdf.text(
            String(item.value),
            x,
            currentY + 14
          )
        }
      )

      currentY +=
        studentCardHeight + 8

      // -----------------------------
      // Results table
      // -----------------------------

      autoTable(pdf, {
        startY: currentY,

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

        margin: {
          left: marginX,
          right: marginX,
        },

        styles: {
          font: "helvetica",
          fontSize: 9,
          textColor: [
            15,
            23,
            42,
          ],
          cellPadding: {
            top: 4,
            right: 4,
            bottom: 4,
            left: 4,
          },
          lineColor: [
            218,
            226,
            235,
          ],
          lineWidth: 0.25,
        },

        headStyles: {
          fillColor: [
            239,
            246,
            251,
          ],
          textColor: [
            15,
            23,
            42,
          ],
          fontStyle: "bold",
          lineColor: [
            218,
            226,
            235,
          ],
          lineWidth: 0.25,
        },

        bodyStyles: {
          fillColor: [
            255,
            255,
            255,
          ],
        },

        alternateRowStyles: {
          fillColor: [
            250,
            252,
            254,
          ],
        },

        columnStyles: {
          0: {
            cellWidth: 47,
            fontStyle: "bold",
          },
          1: {
            cellWidth: 34,
          },
          2: {
            cellWidth: 34,
          },
          3: {
            cellWidth: 25,
          },
          4: {
            cellWidth: 34,
          },
        },
      })

      const tableEndY =
        (
          pdf as jsPDF & {
            lastAutoTable?: {
              finalY: number
            }
          }
        ).lastAutoTable
          ?.finalY ??
        currentY + 40

      currentY =
        tableEndY + 8

      // -----------------------------
      // Summary cards
      // -----------------------------

      currentY = ensureSpace(
        32,
        currentY
      )

      const summaryGap = 4

      const summaryCardWidth =
        (contentWidth -
          summaryGap * 2) /
        3

      const summaryCardHeight =
        24

      const average =
        report.summary.average ===
        null
          ? "-"
          : `${report.summary.average.toFixed(
              1
            )}%`

      const summaries = [
        {
          label: "Average",
          value: average,
        },
        {
          label:
            "Overall Grade",
          value:
            report.summary
              .overallGrade ?? "-",
        },
        {
          label: "Status",
          value:
            report.summary.status,
        },
      ]

      summaries.forEach(
        (item, index) => {
          const x =
            marginX +
            index *
              (summaryCardWidth +
                summaryGap)

          drawRoundedCard(
            x,
            currentY,
            summaryCardWidth,
            summaryCardHeight,
            [250, 252, 254]
          )

          pdf.setFont(
            "helvetica",
            "normal"
          )

          pdf.setFontSize(9)

          pdf.setTextColor(
            100,
            116,
            139
          )

          pdf.text(
            item.label,
            x +
              summaryCardWidth /
                2,
            currentY + 8,
            {
              align: "center",
            }
          )

          pdf.setFont(
            "helvetica",
            "bold"
          )

          pdf.setFontSize(15)

          pdf.setTextColor(
            15,
            23,
            42
          )

          pdf.text(
            String(item.value),
            x +
              summaryCardWidth /
                2,
            currentY + 17,
            {
              align: "center",
            }
          )
        }
      )

      currentY +=
        summaryCardHeight + 8

      // -----------------------------
      // Teacher remarks card
      // -----------------------------

      const remarkLines =
        pdf.splitTextToSize(
          report.summary
            .teacherRemark,
          contentWidth - 12
        )

      const remarkHeight =
        Math.max(
          24,
          17 +
            remarkLines.length * 4
        )

      currentY = ensureSpace(
        remarkHeight + 8,
        currentY
      )

      drawRoundedCard(
        marginX,
        currentY,
        contentWidth,
        remarkHeight,
        [250, 252, 254]
      )

      pdf.setFont(
        "helvetica",
        "bold"
      )

      pdf.setFontSize(9)

      pdf.setTextColor(
        15,
        23,
        42
      )

      pdf.text(
        "Teacher Remarks",
        marginX + 5,
        currentY + 8
      )

      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.setFontSize(9)

      pdf.setTextColor(
        71,
        85,
        105
      )

      pdf.text(
        remarkLines,
        marginX + 5,
        currentY + 15
      )

      currentY +=
        remarkHeight

      // -----------------------------
      // Signature area
      // -----------------------------

      // Signatures must appear on
      // the final page with enough
      // blank space for handwriting.
      if (currentY > 230) {
        pdf.addPage()
      }

      const signatureY =
        pageHeight - 30

      const signatureWidth = 62

      const leftSignatureX =
        marginX

      const rightSignatureX =
        pageWidth -
        marginX -
        signatureWidth

      pdf.setDrawColor(
        100,
        116,
        139
      )

      pdf.setLineWidth(0.3)

      // Dotted appearance
      pdf.setLineDashPattern(
        [1, 1.5],
        0
      )

      pdf.line(
        leftSignatureX,
        signatureY,
        leftSignatureX +
          signatureWidth,
        signatureY
      )

      pdf.line(
        rightSignatureX,
        signatureY,
        rightSignatureX +
          signatureWidth,
        signatureY
      )

      pdf.setLineDashPattern(
        [],
        0
      )

      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.setFontSize(8.5)

      pdf.setTextColor(
        71,
        85,
        105
      )

      pdf.text(
        "Class Teacher's Signature",
        leftSignatureX +
          signatureWidth / 2,
        signatureY + 5,
        {
          align: "center",
        }
      )

      pdf.text(
        "Parent/Guardian's Signature",
        rightSignatureX +
          signatureWidth / 2,
        signatureY + 5,
        {
          align: "center",
        }
      )

      // -----------------------------
      // Footer / page numbers
      // -----------------------------

      const totalPages =
        pdf.getNumberOfPages()

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pdf.setPage(page)

        pdf.setFont(
          "helvetica",
          "normal"
        )

        pdf.setFontSize(7.5)

        pdf.setTextColor(
          148,
          163,
          184
        )

        pdf.text(
          `Generated by EduInsight • Page ${page} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          {
            align: "center",
          }
        )
      }

      // -----------------------------
      // Filename
      // -----------------------------

      const safeStudentName =
        report.student.name
          .replace(
            /[^a-zA-Z0-9]+/g,
            "_"
          )
          .replace(
            /^_+|_+$/g,
            ""
          )

      const safeExamName =
        report.examination.name
          .replace(
            /[^a-zA-Z0-9]+/g,
            "_"
          )
          .replace(
            /^_+|_+$/g,
            ""
          )

      return {
        pdf,
        filename:
          `${safeStudentName}_${safeExamName}_Report.pdf`,
      }
  }

  async function handleExportPdf() {
    try {
      setExportingPdf(true)
      setError("")

      const result =
        buildReportPdf()

      if (!result) return

      result.pdf.save(
        result.filename
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

  async function handlePrintPdf() {
    try {
      setPrintingPdf(true)
      setError("")

      const result =
        buildReportPdf()

      if (!result) return

      const blob =
        result.pdf.output("blob")

      const blobUrl =
        URL.createObjectURL(blob)

      const iframe =
        document.createElement(
          "iframe"
        )

      iframe.style.position =
        "fixed"

      iframe.style.right = "0"
      iframe.style.bottom = "0"
      iframe.style.width = "0"
      iframe.style.height = "0"
      iframe.style.border = "0"

      iframe.src = blobUrl

      document.body.appendChild(
        iframe
      )

      iframe.onload = () => {
        window.setTimeout(() => {
          try {
            iframe.contentWindow?.focus()
            iframe.contentWindow?.print()
          } finally {
            window.setTimeout(
              () => {
                iframe.remove()

                URL.revokeObjectURL(
                  blobUrl
                )
              },
              60000
            )
          }
        }, 500)
      }
    } catch (error) {
      console.error(
        "PDF print error:",
        error
      )

      setError(
        "Unable to prepare the report for printing."
      )
    } finally {
      setPrintingPdf(false)
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
              onClick={handlePrintPdf}
              disabled={
                printingPdf ||
                exportingPdf
              }
            >
              {printingPdf ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Printer className="size-4" />
              )}

              {printingPdf
                ? "Preparing..."
                : "Print"}
            </Button>

            <Button
              className="gap-2"
              onClick={handleExportPdf}
              disabled={
                exportingPdf ||
                printingPdf
              }
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