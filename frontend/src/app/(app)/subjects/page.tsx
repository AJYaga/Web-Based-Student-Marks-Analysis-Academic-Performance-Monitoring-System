"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  BookOpen,
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
  createSubject,
  deleteSubject as deleteSubjectRequest,
  getSubjects,
  updateSubject,
  type SubjectRecord,
} from "@/services/subjects"

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
import {
  useSuccessDialog,
} from "@/components/success-dialog-provider"

import {
  HighlightMatch,
} from "@/components/highlight-match"

export default function SubjectsPage() {
  const [subjects, setSubjects] =
    useState<SubjectRecord[]>([])

  const [classes, setClasses] =
    useState<ClassRecord[]>([])

  const [search, setSearch] =
    useState("")

  const [showForm, setShowForm] =
    useState(false)

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [deleteId, setDeleteId] =
    useState<string | null>(null)

  const [code, setCode] =
    useState("")

  const [name, setName] =
    useState("")

  const [classId, setClassId] =
    useState("")

  const [maxMark, setMaxMark] =
    useState("100")

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [deleting, setDeleting] =
    useState(false)

  const [error, setError] =
    useState("")

  const {
    showSuccess,
  } = useSuccessDialog()

  async function loadPageData() {
    try {
      setLoading(true)
      setError("")

      const [
        subjectsResponse,
        classesResponse,
      ] = await Promise.all([
        getSubjects(),
        getClasses(),
      ])

      setSubjects(
        subjectsResponse.subjects
      )

      setClasses(
        classesResponse.classes
      )

      const firstClass =
        classesResponse.classes[0]

      if (firstClass) {
        setClassId((current) =>
          current || firstClass.id
        )
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load subject information."
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
          subjectsResponse,
          classesResponse,
        ] = await Promise.all([
          getSubjects(),
          getClasses(),
        ])

        if (cancelled) return

        setSubjects(
          subjectsResponse.subjects
        )

        setClasses(
          classesResponse.classes
        )

        const firstClass =
          classesResponse.classes[0]

        if (firstClass) {
          setClassId(firstClass.id)
        }
      } catch (error) {
        if (cancelled) return

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load subject information."
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

  const filtered = useMemo(() => {
    const q =
      search.toLowerCase().trim()

    if (!q) return subjects

    return subjects.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(q) ||
        item.code
          .toLowerCase()
          .includes(q) ||
        item.className
          .toLowerCase()
          .includes(q)
    )
  }, [subjects, search])

  function resetForm() {
    setCode("")
    setName("")
    setMaxMark("100")
    setClassId(
      classes[0]?.id ?? ""
    )
    setEditingId(null)
    setError("")
  }

  async function saveSubject() {
    if (saving) {
      return
    }
    
    if (
      !code.trim() ||
      !name.trim() ||
      !classId
    ) {
      setError(
        "Please enter the subject code, name and class."
      )
      return
    }

    const maximum =
      Number(maxMark)

    if (
      !Number.isInteger(maximum) ||
      maximum <= 0
    ) {
      setError(
        "Maximum mark must be a positive number."
      )
      return
    }

    try {
      setSaving(true)
      setError("")

      if (editingId) {
        await updateSubject(
          editingId,
          {
            code,
            name,
            maxMark: maximum,
            classId,
          }
        )

        showSuccess(
          "Subject updated successfully."
        )
      } else {
        await createSubject({
          code,
          name,
          maxMark: maximum,
          classId,
        })

        showSuccess(
          "Subject added successfully."
        )
      }

      await loadPageData()

      resetForm()
      setShowForm(false)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save subject."
      )
    } finally {
      setSaving(false)
    }
  }

  function editSubject(
    item: SubjectRecord
  ) {
    setEditingId(item.id)
    setCode(item.code)
    setName(item.name)
    setMaxMark(
      String(item.maxMark)
    )
    setClassId(
      item.classId ?? ""
    )

    setShowForm(true)
    setError("")
  }

  async function confirmDelete() {
    if (deleting) {
      return
    }
    
    if (!deleteId) return

    try {
      setDeleting(true)
      setError("")

      await deleteSubjectRequest(
        deleteId
      )

      setSubjects((current) =>
        current.filter(
          (subject) =>
            subject.id !== deleteId
        )
      )

      showSuccess(
        "Subject deleted successfully."
      )

      setDeleteId(null)
    } catch (error) {
      setDeleteId(null)

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete subject."
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
            Subject Management
          </h1>

          <p className="mt-1 text-base text-muted-foreground">
            Manage subjects used for marks,
            analytics and reports.
          </p>
        </div>

        <Button
          className="gap-2"
          disabled={
            classes.length === 0 ||
            saving ||
            deleting
          }
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="size-4" />
          Add Subject
        </Button>
      </div>

      {classes.length === 0 &&
        !loading && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            Create a class before
            adding subjects.
          </div>
        )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <Card className="glass max-w-sm">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Subjects
            </p>

            <p className="mt-1 text-3xl font-semibold">
              {subjects.length}
            </p>
          </div>

          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId
                ? "Edit Subject"
                : "Add Subject"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void saveSubject()
              }}
              className="grid gap-4 md:grid-cols-4"
            >
            <div className="space-y-2">
              <label
                htmlFor="subject-code"
                className="text-sm font-medium"
              >
                Subject Code
              </label>

              <Input
                id="subject-code"
                placeholder="Subject code"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value)
                }
                className="h-11"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="subject-name"
                className="text-sm font-medium"
              >
                Subject Name
              </label>

              <Input
                id="subject-name"
                placeholder="Subject name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="h-11"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="subject-class"
                className="text-sm font-medium"
              >
                Class
              </label>

              <select
                id="subject-class"
                value={classId}
                onChange={(e) =>
                  setClassId(e.target.value)
                }
                className="h-11 w-full rounded-lg border border-input bg-background px-3"
                disabled={saving}
              >
                {classes.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name} — {item.academicYear}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="subject-max-mark"
                className="text-sm font-medium"
              >
                Maximum Mark
              </label>

              <Input
                id="subject-max-mark"
                type="number"
                min={1}
                placeholder="Maximum mark"
                value={maxMark}
                onChange={(e) =>
                  setMaxMark(e.target.value)
                }
                className="h-11"
                disabled={saving}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:col-span-4">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={saving}
              >
                {saving && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}

                {saving
                  ? editingId
                    ? "Updating..."
                    : "Saving..."
                  : editingId
                    ? "Update Subject"
                    : "Save Subject"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={saving}
                onClick={() => {
                  resetForm()
                  setShowForm(false)
                }}
              >
                Cancel
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="glass overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">
              Subject List
            </CardTitle>

            <div className="relative w-full md:max-w-sm">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search subjects..."
                aria-label="Search subjects"
                className="pl-9"
                 disabled={
                  loading ||
                  subjects.length === 0
                }
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Loading subjects...
            </div>
          ) : subjects.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpen className="size-5" />
              </div>

              <p className="font-medium">
                No subjects yet
              </p>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Add your first subject to begin managing examinations and marks.
              </p>

              {classes.length > 0 && (
                <Button
                  className="mt-4 gap-2"
                  disabled={saving || deleting}
                  onClick={() => {
                    resetForm()
                    setShowForm(true)
                  }}
                >
                  <Plus className="size-4" />
                  Add Subject
                </Button>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <Search className="mb-3 size-8 text-muted-foreground" />

              <p className="font-medium">
                No matching subjects
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                No subjects match “{search.trim()}”.
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
              <table className="w-full min-w-190">
                <thead className="sticky top-0 z-10 border-y bg-muted/90 backdrop-blur">
                  <tr>
                    <th className="px-5 py-3 text-left">
                      Code
                    </th>

                    <th className="px-5 py-3 text-left">
                      Subject
                    </th>

                    <th className="px-5 py-3 text-left">
                      Class
                    </th>

                    <th className="px-5 py-3 text-left">
                      Max Mark
                    </th>

                    <th className="px-5 py-3 text-left">
                      Status
                    </th>

                    <th className="sticky right-0 z-20 bg-muted/95 px-5 py-3 text-right backdrop-blur">
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
                      <td className="whitespace-nowrap px-5 py-4 font-medium">
                        <HighlightMatch
                          text={item.code}
                          query={search}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <HighlightMatch
                          text={item.name}
                          query={search}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <HighlightMatch
                          text={item.className}
                          query={search}
                        />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {item.maxMark}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                          {item.status === "ACTIVE"
                            ? "Active"
                            : item.status}
                        </span>
                      </td>

                      <td className="sticky right-0 z-10 bg-background/95 px-5 py-4 backdrop-blur">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${item.name}`}
                            disabled={saving || deleting}
                            onClick={() =>
                              editSubject(item)
                            }
                          >
                            <Pencil className="size-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${item.name}`}
                            disabled={saving || deleting}
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
              Remove subject?
            </AlertDialogTitle>

            <AlertDialogDescription className="w-full text-center">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting
                ? "Deleting..."
                : "Delete Subject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}