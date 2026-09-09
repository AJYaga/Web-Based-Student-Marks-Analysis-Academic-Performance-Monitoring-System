"use client"

import { useEffect, useMemo, useState } from "react"
import {
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import {
  createClass,
  deleteClass as deleteClassRequest,
  getClasses,
  updateClass,
  type ClassRecord,
} from "@/services/classes"

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

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRecord[]>([])
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [deleteId, setDeleteId] =
    useState<string | null>(null)

  const [name, setName] = useState("")
  const [level, setLevel] = useState("Grade 10")
  const [year, setYear] = useState("2026")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const {
    showSuccess,
  } = useSuccessDialog()

  useEffect(() => {
    loadClasses()
  }, [])

  async function loadClasses() {
    try {
      setLoading(true)
      setError("")

      const response = await getClasses()
      setClasses(response.classes)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load classes."
      )
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()

    if (!q) {
      return classes
    }

    return classes.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.level.toLowerCase().includes(q) ||
        String(item.academicYear).includes(q)
    )
  }, [classes, search])

  function resetForm() {
    setName("")
    setLevel("Grade 10")
    setYear("2026")
    setEditingId(null)
    setError("")
  }

  async function saveClass() {
    if (saving) {
      return
    }
    
    if (!name.trim()) {
      setError("Please enter a class name.")
      return
    }

    const academicYear = Number(year)

    if (
      !Number.isInteger(academicYear) ||
      academicYear < 2000 ||
      academicYear > 2100
    ) {
      setError("Please enter a valid academic year.")
      return
    }

    try {
      setSaving(true)
      setError("")

      if (editingId) {
        await updateClass(editingId, {
          name,
          level,
          academicYear,
        })

        showSuccess("Class updated successfully.")
      } else {
        await createClass({
          name,
          level,
          academicYear,
        })

        showSuccess("Class created successfully.")
      }

      await loadClasses()

      resetForm()
      setShowForm(false)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save class."
      )
    } finally {
      setSaving(false)
    }
  }

  function editClass(item: ClassRecord) {
    setEditingId(item.id)
    setName(item.name)
    setLevel(item.level)
    setYear(String(item.academicYear))
    setShowForm(true)
    setError("")
  }

  async function confirmDeleteClass() {
    if (deleting) {
      return
    }
    
    if (!deleteId) {
      return
    }

    try {
      setDeleting(true)
      setError("")

      await deleteClassRequest(deleteId)

      setClasses((current) =>
        current.filter((item) => item.id !== deleteId)
      )

      showSuccess("Class deleted successfully.")
      setDeleteId(null)
    } catch (error) {
      setDeleteId(null)

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete class."
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
            Class Management
          </h1>

          <p className="mt-1 text-base text-muted-foreground">
            Create and manage academic classes.
          </p>
        </div>

        <Button
          className="gap-2"
          disabled={saving || deleting}
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="size-4" />
          Add Class
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

      <Card className="glass max-w-sm">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Classes
            </p>

            <p className="mt-1 text-3xl font-semibold">
              {classes.length}
            </p>
          </div>

          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="size-5" />
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Class" : "Add Class"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void saveClass()
              }}
              className="grid gap-4 md:grid-cols-3"
            >
            <div className="space-y-2">
              <label
                htmlFor="class-name"
                className="text-sm font-medium"
              >
                Class Name
              </label>

              <Input
                id="class-name"
                placeholder="Class name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="class-level"
                className="text-sm font-medium"
              >
                Level
              </label>

              <select
                id="class-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-3"
                disabled={saving}
              >
                <option>Grade 9</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>Grade 12</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="academic-year"
                className="text-sm font-medium"
              >
                Academic Year
              </label>

              <Input
                id="academic-year"
                type="number"
                placeholder="Academic year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-11"
                disabled={saving}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:col-span-3">
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
                    ? "Update Class"
                    : "Save Class"}
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
              Class List
            </CardTitle>

            <div className="relative w-full md:max-w-sm">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                placeholder="Search classes..."
                aria-label="Search classes"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                disabled={
                  loading ||
                  classes.length === 0
                }
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Loading classes...
            </div>
          ) : classes.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="size-5" />
              </div>

              <p className="font-medium">
                No classes yet
              </p>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first class to begin organising students and subjects.
              </p>

              <Button
                className="mt-4 gap-2"
                disabled={saving || deleting}
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
              >
                <Plus className="size-4" />
                Add Class
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <Search className="mb-3 size-8 text-muted-foreground" />

              <p className="font-medium">
                No matching classes
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                No classes match “{search.trim()}”.
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
              <table className="w-full min-w-175">
                <thead className="sticky top-0 z-10 border-y bg-muted/90 backdrop-blur">
                  <tr>
                    <th className="px-5 py-3 text-left">
                      Class
                    </th>
                    <th className="px-5 py-3 text-left">
                      Level
                    </th>
                    <th className="px-5 py-3 text-left">
                      Academic Year
                    </th>
                    <th className="px-5 py-3 text-left">
                      Students
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
                      <td className="px-5 py-4 font-medium">
                        <HighlightMatch
                          text={item.name}
                          query={search}
                        />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <HighlightMatch
                          text={item.level}
                          query={search}
                        />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <HighlightMatch
                          text={String(item.academicYear)}
                          query={search}
                        />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {item.students}
                      </td>

                      <td className="sticky right-0 z-10 bg-background/95 px-5 py-4 backdrop-blur">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${item.name}`}
                            disabled={saving || deleting}
                            onClick={() =>
                              editClass(item)
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
              Remove class?
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
              onClick={confirmDeleteClass}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting
                ? "Deleting..."
                : "Delete Class"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}