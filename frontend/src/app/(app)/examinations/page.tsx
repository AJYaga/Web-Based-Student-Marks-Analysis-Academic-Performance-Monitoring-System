"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import {
  getClasses,
  type ClassRecord,
} from "@/services/classes"

import {
  getSubjects,
  type SubjectRecord,
} from "@/services/subjects"

import {
  createExamination,
  deleteExamination as deleteExaminationRequest,
  getExaminations,
  updateExamination,
  type ExaminationRecord,
} from "@/services/examinations"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Calendar } from "@/components/ui/calendar"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(value: string) {
  if (!value) return "Select examination date"

  const [year, month, day] =
    value.split("-").map(Number)

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function ExaminationsPage() {
  const [exams, setExams] =
    useState<ExaminationRecord[]>([])

  const [classes, setClasses] =
    useState<ClassRecord[]>([])

  const [subjects, setSubjects] =
    useState<SubjectRecord[]>([])

  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [deleteId, setDeleteId] =
    useState<string | null>(null)

  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [classId, setClassId] = useState("")
  const [term, setTerm] = useState("Term 1")

  const [selectedSubjectIds, setSelectedSubjectIds] =
    useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function loadPageData() {
    try {
      setLoading(true)

      const [
        examinationResponse,
        classResponse,
        subjectResponse,
      ] = await Promise.all([
        getExaminations(),
        getClasses(),
        getSubjects(),
      ])

      setExams(examinationResponse.examinations)
      setClasses(classResponse.classes)
      setSubjects(subjectResponse.subjects)

      const firstClass = classResponse.classes[0]

      if (firstClass) {
        setClassId((current) =>
          current || firstClass.id
        )
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load examination information."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function initialLoad() {
      try {
        const [
          examinationResponse,
          classResponse,
          subjectResponse,
        ] = await Promise.all([
          getExaminations(),
          getClasses(),
          getSubjects(),
        ])

        if (cancelled) return

        setExams(examinationResponse.examinations)
        setClasses(classResponse.classes)
        setSubjects(subjectResponse.subjects)

        const firstClass = classResponse.classes[0]

        if (firstClass) {
          setClassId(firstClass.id)
        }
      } catch (error) {
        if (cancelled) return

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load examination information."
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

  const availableSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) =>
          subject.classId === classId
      ),
    [subjects, classId]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()

    if (!q) return exams

    return exams.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.className.toLowerCase().includes(q) ||
        item.term.toLowerCase().includes(q)
    )
  }, [exams, search])

  function resetForm() {
    setName("")
    setDate("")
    setTerm("Term 1")
    setClassId(classes[0]?.id ?? "")
    setSelectedSubjectIds([])
    setEditingId(null)
    setError("")
  }

  function toggleSubject(subjectId: string) {
    setSelectedSubjectIds((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId]
    )
  }

  async function saveExam() {
    if (
      !name.trim() ||
      !date ||
      !classId ||
      selectedSubjectIds.length === 0
    ) {
      setError(
        "Please enter the examination details and select at least one subject."
      )
      return
    }

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const data = {
        name,
        date,
        term,
        classId,
        subjectIds: selectedSubjectIds,
      }

      if (editingId) {
        await updateExamination(editingId, data)

        setSuccess(
          "Examination updated successfully."
        )
      } else {
        await createExamination(data)

        setSuccess(
          "Examination created successfully."
        )
      }

      await loadPageData()

      resetForm()
      setShowForm(false)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save examination."
      )
    } finally {
      setSaving(false)
    }
  }

  function editExam(item: ExaminationRecord) {
    setEditingId(item.id)
    setName(item.name)
    setDate(item.date)
    setClassId(item.classId)
    setTerm(item.term)

    setSelectedSubjectIds(
      item.subjects.map((subject) => subject.id)
    )

    setShowForm(true)
    setError("")
    setSuccess("")
  }

  async function confirmDelete() {
    if (!deleteId) return

    try {
      setDeleting(true)
      setError("")
      setSuccess("")

      await deleteExaminationRequest(deleteId)

      setExams((current) =>
        current.filter(
          (item) => item.id !== deleteId
        )
      )

      setSuccess(
        "Examination deleted successfully."
      )

      setDeleteId(null)
    } catch (error) {
      setDeleteId(null)

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete examination."
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            Academic Setup
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Examination Management
          </h1>

          <p className="mt-1 text-base text-muted-foreground">
            Create and maintain examination records.
          </p>
        </div>

        <Button
          className="gap-2"
          disabled={classes.length === 0}
          onClick={() => {
            resetForm()
            setSuccess("")
            setShowForm(true)
          }}
        >
          <Plus className="size-4" />
          Add Examination
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-secondary bg-secondary/40 px-4 py-3 text-sm font-medium">
          {success}
        </div>
      )}

      <Card className="glass max-w-sm">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Examinations
            </p>

            <p className="mt-1 text-3xl font-semibold">
              {exams.length}
            </p>
          </div>

          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="size-5" />
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId
                ? "Edit Examination"
                : "Add Examination"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-4">
              <Input
                placeholder="Examination name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="h-11"
                disabled={saving}
              />

              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full justify-start gap-2 px-3 font-normal"
                      disabled={saving}
                    />
                  }
                >
                  <CalendarDays className="size-4 text-muted-foreground" />

                  <span
                    className={
                      !date
                        ? "text-muted-foreground"
                        : ""
                    }
                  >
                    {formatDate(date)}
                  </span>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="w-auto p-0"
                >
                  <Calendar
                    mode="single"
                    selected={
                      date
                        ? (() => {
                            const [
                              year,
                              month,
                              day,
                            ] = date
                              .split("-")
                              .map(Number)

                            return new Date(
                              year,
                              month - 1,
                              day
                            )
                          })()
                        : undefined
                    }
                    onSelect={(selectedDate) => {
                      if (!selectedDate) return

                      const year =
                        selectedDate.getFullYear()

                      const month = String(
                        selectedDate.getMonth() + 1
                      ).padStart(2, "0")

                      const day = String(
                        selectedDate.getDate()
                      ).padStart(2, "0")

                      setDate(
                        `${year}-${month}-${day}`
                      )
                    }}
                  />
                </PopoverContent>
              </Popover>

              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value)
                  setSelectedSubjectIds([])
                }}
                className="h-11 rounded-lg border border-input bg-background px-3"
                disabled={saving}
              >
                {classes.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name} —{" "}
                    {item.academicYear}
                  </option>
                ))}
              </select>

              <select
                value={term}
                onChange={(e) =>
                  setTerm(e.target.value)
                }
                className="h-11 rounded-lg border border-input bg-background px-3"
                disabled={saving}
              >
                <option>Term 1</option>
                <option>Term 2</option>
                <option>Term 3</option>
              </select>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  Subjects
                </p>

                <p className="text-xs text-muted-foreground">
                  Select the subjects included in this examination.
                </p>
              </div>

              {availableSubjects.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No subjects are assigned to the selected class.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {availableSubjects.map((subject) => (
                    <label
                      key={subject.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 hover:bg-muted/40"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubjectIds.includes(
                          subject.id
                        )}
                        onChange={() =>
                          toggleSubject(subject.id)
                        }
                        disabled={saving}
                        className="size-4 accent-primary"
                      />

                      <div>
                        <p className="text-sm font-medium">
                          {subject.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {subject.code} • Max{" "}
                          {subject.maxMark}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={saveExam}
                disabled={
                  saving ||
                  selectedSubjectIds.length === 0
                }
              >
                {saving && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}

                {editingId
                  ? "Update Examination"
                  : "Save Examination"}
              </Button>

              <Button
                variant="outline"
                disabled={saving}
                onClick={() => {
                  resetForm()
                  setShowForm(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg">
              Examination List
            </CardTitle>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search examinations..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Loading examinations...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No examinations found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-190">
                <thead className="border-y bg-muted/50">
                  <tr>
                    <th className="px-5 py-3 text-left">
                      Examination
                    </th>

                    <th className="px-5 py-3 text-left">
                      Class
                    </th>

                    <th className="px-5 py-3 text-left">
                      Term
                    </th>

                    <th className="px-5 py-3 text-left">
                      Subjects
                    </th>

                    <th className="px-5 py-3 text-left">
                      Date
                    </th>

                    <th className="px-5 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30"
                    >
                      <td className="px-5 py-4 font-medium">
                        {item.name}
                      </td>

                      <td className="px-5 py-4">
                        {item.className}
                      </td>

                      <td className="px-5 py-4">
                        {item.term}
                      </td>

                      <td className="px-5 py-4">
                        {item.subjects
                          .map(
                            (subject) =>
                              subject.code
                          )
                          .join(", ")}
                      </td>

                      <td className="px-5 py-4">
                        {formatDate(item.date)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              editExam(item)
                            }
                          >
                            <Pencil className="size-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteId(item.id)
                            }
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteId(null)
          }
        }}
      >
        <AlertDialogContent className="glass-strong">
          <AlertDialogHeader className="items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 className="size-5" />
            </div>

            <AlertDialogTitle className="w-full text-center">
              Remove examination?
            </AlertDialogTitle>

            <AlertDialogDescription className="w-full text-center">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting
                ? "Deleting..."
                : "Delete Examination"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}