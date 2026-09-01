"use client"

import { useMemo, useState } from "react"
import {
  CheckCircle2,
  ClipboardPenLine,
  Save,
  Search,
  TriangleAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type StudentMark = {
  id: string
  name: string
  marks: string
  absent: boolean
}

const initialStudents: StudentMark[] = [
  { id: "ST001", name: "Nimal Perera", marks: "78", absent: false },
  { id: "ST002", name: "Kavindu Silva", marks: "65", absent: false },
  { id: "ST003", name: "Amaya Fernando", marks: "88", absent: false },
  { id: "ST004", name: "Sahan Kumara", marks: "", absent: false },
  { id: "ST005", name: "Dinithi Jayasinghe", marks: "73", absent: false },
]

const MAX_MARK = 100
const PASS_MARK = 40

function getGrade(mark: number) {
  if (mark >= 75) return "A"
  if (mark >= 65) return "B"
  if (mark >= 55) return "C"
  if (mark >= 40) return "S"
  return "F"
}

export default function MarksPage() {
  const [students, setStudents] = useState<StudentMark[]>(initialStudents)
  const [search, setSearch] = useState("")
  const [saved, setSaved] = useState(false)

  const [academicYear, setAcademicYear] = useState("2026")
  const [className, setClassName] = useState("Grade 10-A")
  const [subject, setSubject] = useState("Mathematics")
  const [exam, setExam] = useState("First Term Examination")

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim()

    if (!q) return students

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(q) ||
        student.id.toLowerCase().includes(q)
    )
  }, [search, students])

  const invalidCount = students.filter((student) => {
    if (student.absent || student.marks === "") return false

    const value = Number(student.marks)

    return Number.isNaN(value) || value < 0 || value > MAX_MARK
  }).length

  const missingCount = students.filter(
    (student) => !student.absent && student.marks === ""
  ).length

  function updateMark(id: string, value: string) {
    setSaved(false)

    setStudents((current) =>
      current.map((student) =>
        student.id === id
          ? {
              ...student,
              marks: value,
              absent: value !== "" ? false : student.absent,
            }
          : student
      )
    )
  }

  function toggleAbsent(id: string) {
    setSaved(false)

    setStudents((current) =>
      current.map((student) =>
        student.id === id
          ? {
              ...student,
              absent: !student.absent,
              marks: !student.absent ? "" : student.marks,
            }
          : student
      )
    )
  }

  function handleSave() {
    if (invalidCount > 0 || missingCount > 0) return

    setSaved(true)
  }

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
            Enter and validate examination marks efficiently.
          </p>
        </div>

        <Button
          className="gap-2"
          onClick={handleSave}
          disabled={invalidCount > 0 || missingCount > 0}
        >
          <Save className="size-4" />
          Save Marks
        </Button>
      </div>

      {/* Selection context */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">
            Examination Context
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Academic Year
            </label>

            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
            >
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Class
            </label>

            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
            >
              <option>Grade 10-A</option>
              <option>Grade 10-B</option>
              <option>Grade 11-A</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Subject
            </label>

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
            >
              <option>Mathematics</option>
              <option>Science</option>
              <option>English</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Examination
            </label>

            <select
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
            >
              <option>First Term Examination</option>
              <option>Mid Year Examination</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardPenLine className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Maximum Mark
              </p>
              <p className="text-2xl font-semibold">
                {MAX_MARK}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <CheckCircle2 className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Pass Mark
              </p>
              <p className="text-2xl font-semibold">
                {PASS_MARK}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <TriangleAlert className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Missing / Invalid
              </p>
              <p className="text-2xl font-semibold">
                {missingCount + invalidCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-secondary bg-secondary/50 px-4 py-3 text-sm font-medium">
          <CheckCircle2 className="size-4" />
          Marks saved successfully.
        </div>
      )}

      {(missingCount > 0 || invalidCount > 0) && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />

          <div>
            <p className="font-medium">
              Marks require attention
            </p>

            <p className="mt-0.5 text-sm">
              {missingCount > 0 && `${missingCount} missing mark(s). `}
              {invalidCount > 0 && `${invalidCount} invalid mark(s).`}
            </p>
          </div>
        </div>
      )}

      {/* Marks table */}
      <Card className="glass overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">
                Student Marks
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {className} • {subject} • {exam}
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="h-10 pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-225">
              <thead className="sticky top-0 z-10 border-y bg-muted/90 backdrop-blur">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Student ID
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Student Name
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Marks / {MAX_MARK}
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
                {filteredStudents.map((student) => {
                  const numericMark =
                    student.marks === "" ? null : Number(student.marks)

                  const invalid =
                    numericMark !== null &&
                    (Number.isNaN(numericMark) ||
                      numericMark < 0 ||
                      numericMark > MAX_MARK)

                  const percentage =
                    numericMark !== null && !invalid
                      ? (numericMark / MAX_MARK) * 100
                      : null

                  const grade =
                    percentage !== null
                      ? getGrade(percentage)
                      : "-"

                  const passed =
                    percentage !== null &&
                    percentage >= PASS_MARK

                  return (
                    <tr
                      key={student.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4 text-sm font-medium">
                        {student.id}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium">
                          {student.name}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <Input
                          type="number"
                          min={0}
                          max={MAX_MARK}
                          value={student.marks}
                          disabled={student.absent}
                          onChange={(e) =>
                            updateMark(student.id, e.target.value)
                          }
                          className={
                            invalid
                              ? "h-10 w-28 border-destructive focus-visible:ring-destructive"
                              : "h-10 w-28"
                          }
                          aria-label={`Marks for ${student.name}`}
                        />

                        {invalid && (
                          <p className="mt-1 text-xs text-destructive">
                            0–{MAX_MARK} only
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={student.absent}
                          onChange={() => toggleAbsent(student.id)}
                          className="size-4 accent-primary"
                          aria-label={`Mark ${student.name} absent`}
                        />
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {student.absent
                          ? "Absent"
                          : percentage !== null
                            ? `${percentage.toFixed(1)}%`
                            : "-"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium">
                        {student.absent ? "-" : grade}
                      </td>

                      <td className="px-5 py-4">
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
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}