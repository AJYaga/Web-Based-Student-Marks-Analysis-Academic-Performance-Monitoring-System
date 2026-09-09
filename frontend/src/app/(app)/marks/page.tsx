"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  CheckCircle2,
  ClipboardPenLine,
  Loader2,
  Save,
  Search,
  TriangleAlert,
} from "lucide-react"

import {
  getClasses,
  type ClassRecord,
} from "@/services/classes"

import {
  getExaminations,
  type ExaminationRecord,
} from "@/services/examinations"

import {
  getMarks,
  saveMarks,
  type MarksContext,
} from "@/services/marks"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import {
  useSuccessDialog,
} from "@/components/success-dialog-provider"

import {
  HighlightMatch,
} from "@/components/highlight-match"

type EditableStudentMark = {
  studentId: string
  registrationNo: string
  name: string
  marks: string
  absent: boolean
}

function getGrade(percentage: number) {
  if (percentage >= 75) return "A"
  if (percentage >= 65) return "B"
  if (percentage >= 55) return "C"
  if (percentage >= 40) return "S"
  return "F"
}

export default function MarksPage() {
  const [classes, setClasses] =
    useState<ClassRecord[]>([])

  const [examinations, setExaminations] =
    useState<ExaminationRecord[]>([])

  const [students, setStudents] =
    useState<EditableStudentMark[]>([])

  const [context, setContext] =
    useState<MarksContext | null>(null)

  const [classId, setClassId] =
    useState("")

  const [examId, setExamId] =
    useState("")

  const [subjectId, setSubjectId] =
    useState("")

  const [search, setSearch] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [loadingMarks, setLoadingMarks] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState("")

  const {
    showSuccess,
  } = useSuccessDialog()

  const classExaminations = useMemo(
    () =>
      examinations.filter(
        (exam) =>
          exam.classId === classId
      ),
    [examinations, classId]
  )

  const selectedExam =
    classExaminations.find(
      (exam) => exam.id === examId
    )

  const availableSubjects =
    selectedExam?.subjects ?? []

  const maxMark =
    context?.maxMark ??
    availableSubjects.find(
      (subject) =>
        subject.id === subjectId
    )?.maxMark ??
    100

  const passMark =
    context?.passMark ??
    availableSubjects.find(
      (subject) =>
        subject.id === subjectId
    )?.passMark ??
    40

  useEffect(() => {
    let cancelled = false

    async function initialLoad() {
      try {
        const [
          classResponse,
          examinationResponse,
        ] = await Promise.all([
          getClasses(),
          getExaminations(),
        ])

        if (cancelled) return

        setClasses(
          classResponse.classes
        )

        setExaminations(
          examinationResponse.examinations
        )

        const firstClass =
          classResponse.classes[0]

        if (firstClass) {
          const firstExam =
            examinationResponse.examinations.find(
              (exam) =>
                exam.classId === firstClass.id
            )

          const firstSubject =
            firstExam?.subjects[0]

          setClassId(firstClass.id)
          setExamId(firstExam?.id ?? "")
          setSubjectId(firstSubject?.id ?? "")
        }
      } catch (error) {
        if (cancelled) return

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load marks setup."
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
      !classId ||
      !examId ||
      !subjectId
    ) {
      return
    }

    let cancelled = false

    async function loadMarks() {
      try {
        setLoadingMarks(true)
        setError("")

        const response =
          await getMarks(
            classId,
            examId,
            subjectId
          )

        if (cancelled) return

        setContext(response.context)

        setStudents(
          response.students.map(
            (student) => ({
              studentId:
                student.studentId,

              registrationNo:
                student.registrationNo,

              name: student.name,

              marks:
                student.marksObtained ===
                null
                  ? ""
                  : String(
                      student.marksObtained
                    ),

              absent:
                student.isAbsent,
            })
          )
        )
      } catch (error) {
        if (cancelled) return

        setStudents([])
        setContext(null)

        setError(
          error instanceof Error
            ? error.message
            : "Unable to retrieve marks."
        )
      } finally {
        if (!cancelled) {
          setLoadingMarks(false)
        }
      }
    }

    void loadMarks()

    return () => {
      cancelled = true
    }
  }, [
    classId,
    examId,
    subjectId,
  ])

  const filteredStudents =
    useMemo(() => {
      const q =
        search.toLowerCase().trim()

      if (!q) return students

      return students.filter(
        (student) =>
          student.name
            .toLowerCase()
            .includes(q) ||
          student.registrationNo
            .toLowerCase()
            .includes(q)
      )
    }, [students, search])

  const invalidCount =
    students.filter((student) => {
      if (
        student.absent ||
        student.marks === ""
      ) {
        return false
      }

      const value =
        Number(student.marks)

      return (
        Number.isNaN(value) ||
        value < 0 ||
        value > maxMark
      )
    }).length

  const missingCount =
    students.filter(
      (student) =>
        !student.absent &&
        student.marks === ""
    ).length

  function updateMark(
    studentId: string,
    value: string
  ) {
    setStudents((current) =>
      current.map((student) =>
        student.studentId ===
        studentId
          ? {
              ...student,
              marks: value,
              absent:
                value !== ""
                  ? false
                  : student.absent,
            }
          : student
      )
    )
  }

  function toggleAbsent(
    studentId: string
  ) {
    setStudents((current) =>
      current.map((student) =>
        student.studentId ===
        studentId
          ? {
              ...student,

              absent:
                !student.absent,

              marks:
                !student.absent
                  ? ""
                  : student.marks,
            }
          : student
      )
    )
  }

  async function handleSave() {
    if (saving || loadingMarks) {
      return
    }
    
    if (
      !classId ||
      !examId ||
      !subjectId
    ) {
      return
    }

    if (
      invalidCount > 0 ||
      missingCount > 0
    ) {
      return
    }

    try {
      setSaving(true)
      setError("")
      await saveMarks({
        classId,
        examinationId: examId,
        subjectId,

        marks: students.map(
          (student) => ({
            studentId:
              student.studentId,

            marksObtained:
              student.absent
                ? null
                : Number(
                    student.marks
                  ),

            isAbsent:
              student.absent,
          })
        ),
      })

      showSuccess(
        "Marks saved successfully."
      )

      const refreshed =
        await getMarks(
          classId,
          examId,
          subjectId
        )

      setContext(
        refreshed.context
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save marks."
      )
    } finally {
      setSaving(false)
    }
  }

  const selectedClass =
    classes.find(
      (item) =>
        item.id === classId
    )

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            Performance
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Marks Entry
          </h1>

          <p className="mt-1 text-base text-muted-foreground">
            Enter and validate examination
            marks efficiently.
          </p>
        </div>
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
        <CardHeader>
          <CardTitle className="text-lg">
            Examination Context
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <p
              id="academic-year-label"
              className="text-sm font-medium"
            >
              Academic Year
            </p>

            <div
              aria-labelledby="academic-year-label"
              className="flex h-11 items-center rounded-lg border border-input bg-muted/30 px-3 text-sm"
            >
              {selectedClass?.academicYear ??
                "-"}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="marks-class"
              className="text-sm font-medium"
            >
              Class
            </label>

            <select
              value={classId}
              id="marks-class"
              onChange={(e) => {
                const nextClassId =
                  e.target.value

                const nextExam =
                  examinations.find(
                    (exam) =>
                      exam.classId === nextClassId
                  )

                const nextSubject =
                  nextExam?.subjects[0]

                setClassId(nextClassId)
                setExamId(nextExam?.id ?? "")
                setSubjectId(nextSubject?.id ?? "")

                setStudents([])
                setContext(null)
                setError("")
              }}
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
              disabled={
                loading ||
                loadingMarks ||
                saving
              }
            >
              {classes.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="marks-examination"
              className="text-sm font-medium"
            >
              Examination
            </label>

            <select
              value={examId}
              id="marks-examination"
              onChange={(e) => {
                const nextExamId =
                  e.target.value

                const nextExam =
                  examinations.find(
                    (exam) =>
                      exam.id === nextExamId
                  )

                const nextSubject =
                  nextExam?.subjects[0]

                setExamId(nextExamId)
                setSubjectId(nextSubject?.id ?? "")

                setStudents([])
                setContext(null)
                setError("")
              }}
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
              disabled={
                classExaminations.length === 0 ||
                loadingMarks ||
                saving
              }
            >
              {classExaminations.length ===
              0 ? (
                <option value="">
                  No examinations
                </option>
              ) : (
                classExaminations.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  )
                )
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="marks-subject"
              className="text-sm font-medium"
            >
              Subject
            </label>

            <select
              value={subjectId}
              id="marks-subject"
              onChange={(e) => {
                setSubjectId(e.target.value)

                setStudents([])
                setContext(null)
                setError("")
              }}
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
              disabled={
                availableSubjects.length === 0 ||
                loadingMarks ||
                saving
              }
            >
              {availableSubjects.length ===
              0 ? (
                <option value="">
                  No subjects
                </option>
              ) : (
                availableSubjects.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  )
                )
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardPenLine
                aria-hidden="true"
                className="size-5"
              />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Maximum Mark
              </p>

              <p className="text-2xl font-semibold">
                {maxMark}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <CheckCircle2
                aria-hidden="true"
                className="size-5"
              />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Pass Mark
              </p>

              <p className="text-2xl font-semibold">
                {passMark}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <TriangleAlert
                aria-hidden="true"
                className="size-5"
              />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Missing or Invalid
              </p>

              <p className="text-2xl font-semibold">
                {missingCount +
                  invalidCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {(missingCount > 0 ||
        invalidCount > 0) &&
        students.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />

            <div>
              <p className="font-medium">
                Marks require attention
              </p>

              <p className="mt-0.5">
                {missingCount > 0 &&
                  `${missingCount} ${missingCount === 1 ? "mark is" : "marks are"} missing.`}

                {missingCount > 0 &&
                  invalidCount > 0 &&
                  " "}

                {invalidCount > 0 &&
                  `${invalidCount} ${invalidCount === 1 ? "mark is" : "marks are"} invalid.`}
              </p>
            </div>
          </div>
        )}

      <Card className="glass overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">
                Student Marks
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {context
                  ? `${context.className} • ${context.subjectName} • ${context.examinationName}`
                  : "Select a valid examination context"}
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search students..."
                aria-label="Search students"
                className="h-10 pl-9"
                disabled={
                  loadingMarks ||
                  saving ||
                  students.length === 0
                }
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loadingMarks ? (
            <div className="flex min-h-56 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Loading marks...
            </div>
          ) : students.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ClipboardPenLine
                  aria-hidden="true"
                  className="size-5"
                />
              </div>

              <p className="font-medium">
                No students available
              </p>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                No students are available for the selected examination context.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <Search className="mb-3 size-8 text-muted-foreground" />

              <p className="font-medium">
                No matching students
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                No students match “{search.trim()}”.
              </p>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearch("")}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-225">
                <thead className="sticky top-0 z-10 border-y bg-muted/90 backdrop-blur">
                  <tr>
                    <th className="sticky left-0 z-20 w-32 min-w-32 bg-muted/95 px-5 py-3 text-left text-sm font-semibold backdrop-blur">
                      Student ID
                    </th>

                    <th className="sticky left-32 z-20 min-w-48 bg-muted/95 px-5 py-3 text-left text-sm font-semibold backdrop-blur">
                      Student Name
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold">
                      Marks / {maxMark}
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold">
                      Absent
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold">
                      Percentage
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold">
                      Grade
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredStudents.map(
                    (student) => {
                      const numericMark =
                        student.marks === ""
                          ? null
                          : Number(student.marks)

                      const invalid =
                        numericMark !== null &&
                        (Number.isNaN(numericMark) ||
                          numericMark < 0 ||
                          numericMark > maxMark)

                      const markErrorId =
                        `mark-error-${student.studentId}`

                      const percentage =
                        numericMark !== null &&
                        !invalid
                          ? (numericMark / maxMark) * 100
                          : null

                      const grade =
                        percentage !== null
                          ? getGrade(percentage)
                          : "-"

                      const passed =
                        numericMark !== null &&
                        !invalid &&
                        numericMark >= passMark

                      return (
                        <tr
                          key={student.studentId}
                          className="transition-colors hover:bg-muted/30"
                        >
                          <td className="sticky left-0 z-10 w-32 min-w-32 whitespace-nowrap bg-background/95 px-5 py-4 text-sm font-medium backdrop-blur">
                            <HighlightMatch
                              text={student.registrationNo}
                              query={search}
                            />
                          </td>

                          <td className="sticky left-32 z-10 min-w-48 bg-background/95 px-5 py-4 backdrop-blur">
                            <span className="text-sm font-medium">
                              <HighlightMatch
                                text={student.name}
                                query={search}
                              />
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <Input
                              type="number"
                              min={0}
                              max={maxMark}
                              value={student.marks}
                              aria-label={`Marks for ${student.name}`}
                              aria-invalid={invalid}
                              aria-describedby={
                                invalid
                                  ? markErrorId
                                  : undefined
                              }
                              disabled={
                                student.absent ||
                                loadingMarks ||
                                saving
                              }
                              onChange={(e) =>
                                updateMark(
                                  student.studentId,
                                  e.target.value
                                )
                              }
                              className={
                                invalid
                                  ? "h-10 w-24 border-destructive focus-visible:ring-destructive sm:w-28"
                                  : "h-10 w-24 sm:w-28"
                              }
                            />

                            {invalid && (
                              <p
                                id={markErrorId}
                                className="mt-1 text-xs text-destructive"
                              >
                                0–{maxMark} only
                              </p>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <input
                              type="checkbox"
                              checked={student.absent}
                              onChange={() =>
                                toggleAbsent(
                                  student.studentId
                                )
                              }
                              disabled={
                                loadingMarks ||
                                saving
                              }
                              aria-label={`Mark ${student.name} as absent`}
                              className="size-4 accent-primary"
                            />
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm">
                            {student.absent
                              ? "Absent"
                              : percentage !== null
                                ? `${percentage.toFixed(1)}%`
                                : "-"}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-medium">
                            {student.absent
                              ? "-"
                              : grade}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            {student.absent ? (
                              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                Absent
                              </span>
                            ) : percentage === null ? (
                              <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                                Missing
                              </span>
                            ) : invalid ? (
                              <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                                Invalid
                              </span>
                            ) : passed ? (
                              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                                Pass
                              </span>
                            ) : (
                              <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                                Fail
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="flex justify-stretch sm:justify-end">
          <Button
            className="w-full gap-2 sm:w-auto"
            onClick={handleSave}
            disabled={
              saving ||
              loadingMarks ||
              invalidCount > 0 ||
              missingCount > 0
            }
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            {saving
              ? "Saving..."
              : "Save Marks"}
          </Button>
        </div>
      )}

    </div>
  )
}