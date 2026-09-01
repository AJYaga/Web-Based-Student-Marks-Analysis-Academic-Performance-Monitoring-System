"use client"

import { useMemo, useState } from "react"
import { Pencil, Plus, Search, Trash2, UserRound } from "lucide-react"

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

const initialStudents = [
  {
    id: "ST001",
    name: "Nimal Perera",
    className: "Grade 10-A",
    average: 78.4,
    status: "Active",
  },
  {
    id: "ST002",
    name: "Kavindu Silva",
    className: "Grade 10-A",
    average: 66.2,
    status: "Active",
  },
  {
    id: "ST003",
    name: "Amaya Fernando",
    className: "Grade 10-A",
    average: 84.9,
    status: "Active",
  },
  {
    id: "ST004",
    name: "Sahan Kumara",
    className: "Grade 10-A",
    average: 49.6,
    status: "Needs Attention",
  },
  {
    id: "ST005",
    name: "Dinithi Jayasinghe",
    className: "Grade 10-A",
    average: 72.1,
    status: "Active",
  },
]

export default function StudentsPage() {
  const [students, setStudents] = useState(initialStudents)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [studentId, setStudentId] = useState("")
  const [studentName, setStudentName] = useState("")
  const [studentClass, setStudentClass] = useState("Grade 10-A")

  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (!query) return students

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query) ||
        student.className.toLowerCase().includes(query)
    )
  }, [search, students])

  function resetForm() {
    setStudentId("")
    setStudentName("")
    setStudentClass("Grade 10-A")
    setEditingId(null)
  }

  function handleSave() {
    if (!studentId.trim() || !studentName.trim()) return

    if (editingId) {
      setStudents((current) =>
        current.map((student) =>
          student.id === editingId
            ? {
                ...student,
                id: studentId,
                name: studentName,
                className: studentClass,
              }
            : student
        )
      )
    } else {
      setStudents((current) => [
        ...current,
        {
          id: studentId,
          name: studentName,
          className: studentClass,
          average: 0,
          status: "Active",
        },
      ])
    }

    resetForm()
    setShowForm(false)
  }

  function handleEdit(student: (typeof initialStudents)[number]) {
    setEditingId(student.id)
    setStudentId(student.id)
    setStudentName(student.name)
    setStudentClass(student.className)
    setShowForm(true)
  }

  function handleDelete() {
    if (!studentToDelete) return

    setStudents((current) =>
        current.filter((student) => student.id !== studentToDelete)
    )

    setStudentToDelete(null)
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            Academic Setup
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Student Management
          </h1>

          <p className="mt-1 text-base text-muted-foreground">
            Add, search, edit and manage student records.
          </p>
        </div>

        <Button
          className="h-10 gap-2 self-start lg:self-auto"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="size-4" />
          Add Student
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Students
              </p>
              <p className="mt-1 text-3xl font-semibold">
                {students.length}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserRound className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Active Students
            </p>
            <p className="mt-1 text-3xl font-semibold">
              {
                students.filter(
                  (student) => student.status === "Active"
                ).length
              }
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Needs Attention
            </p>
            <p className="mt-1 text-3xl font-semibold">
              {
                students.filter(
                  (student) =>
                    student.status === "Needs Attention"
                ).length
              }
            </p>
          </CardContent>
        </Card>
      </section>

      {showForm && (
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Student" : "Add Student"}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Student ID
              </label>

              <Input
                value={studentId}
                onChange={(event) =>
                  setStudentId(event.target.value)
                }
                placeholder="ST006"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Student Name
              </label>

              <Input
                value={studentName}
                onChange={(event) =>
                  setStudentName(event.target.value)
                }
                placeholder="Enter student name"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Class
              </label>

              <select
                value={studentClass}
                onChange={(event) =>
                  setStudentClass(event.target.value)
                }
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Grade 10-A</option>
                <option>Grade 10-B</option>
                <option>Grade 11-A</option>
              </select>
            </div>

            <div className="flex gap-3 md:col-span-3">
              <Button onClick={handleSave}>
                {editingId ? "Update Student" : "Save Student"}
              </Button>

              <Button
                variant="outline"
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">
              Student List
            </CardTitle>

            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search students..."
                className="h-10 pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left">
              <thead className="border-y bg-muted/50">
                <tr>
                  <th className="px-5 py-3 text-sm font-semibold">
                    Student ID
                  </th>
                  <th className="px-5 py-3 text-sm font-semibold">
                    Student Name
                  </th>
                  <th className="px-5 py-3 text-sm font-semibold">
                    Class
                  </th>
                  <th className="px-5 py-3 text-sm font-semibold">
                    Average
                  </th>
                  <th className="px-5 py-3 text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-4 text-sm font-medium">
                      {student.id}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {student.name.charAt(0)}
                        </div>

                        <span className="text-sm font-medium">
                          {student.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {student.className}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {student.average.toFixed(1)}%
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          student.status === "Active"
                            ? "rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                            : "rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
                        }
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${student.name}`}
                          onClick={() => handleEdit(student)}
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${student.name}`}
                          onClick={() =>
                            setStudentToDelete(student.id)
                          }
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-muted-foreground"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    
    <AlertDialog
        open={studentToDelete !== null}
        onOpenChange={(open) => {
            if (!open) setStudentToDelete(null)
        }}
        >
        <AlertDialogContent className="glass-strong">
          <AlertDialogHeader className="items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
            </div>

            <AlertDialogTitle className="w-full text-center text-lg font-semibold">
                Remove student?
            </AlertDialogTitle>

            <AlertDialogDescription className="w-full text-center">
                This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
                Cancel
            </AlertDialogCancel>

            <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
            >
                Delete Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    
    </div>
  )
}