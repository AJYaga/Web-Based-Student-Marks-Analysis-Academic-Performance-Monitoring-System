"use client"

import { useMemo, useState } from "react"
import { BookOpen, Pencil, Plus, Search, Trash2 } from "lucide-react"

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

const initialSubjects = [
  { code: "MAT10", name: "Mathematics", className: "Grade 10", maxMark: 100, status: "Active" },
  { code: "SCI10", name: "Science", className: "Grade 10", maxMark: 100, status: "Active" },
  { code: "ENG10", name: "English", className: "Grade 10", maxMark: 100, status: "Active" },
]

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState(initialSubjects)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [deleteCode, setDeleteCode] = useState<string | null>(null)

  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [className, setClassName] = useState("Grade 10")
  const [maxMark, setMaxMark] = useState("100")

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return subjects

    return subjects.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
    )
  }, [subjects, search])

  function resetForm() {
    setCode("")
    setName("")
    setClassName("Grade 10")
    setMaxMark("100")
    setEditingCode(null)
  }

  function saveSubject() {
    if (!code.trim() || !name.trim()) return

    if (editingCode) {
      setSubjects((current) =>
        current.map((item) =>
          item.code === editingCode
            ? {
                ...item,
                code,
                name,
                className,
                maxMark: Number(maxMark),
              }
            : item
        )
      )
    } else {
      setSubjects((current) => [
        ...current,
        {
          code,
          name,
          className,
          maxMark: Number(maxMark),
          status: "Active",
        },
      ])
    }

    resetForm()
    setShowForm(false)
  }

  function editSubject(item: (typeof initialSubjects)[number]) {
    setEditingCode(item.code)
    setCode(item.code)
    setName(item.name)
    setClassName(item.className)
    setMaxMark(String(item.maxMark))
    setShowForm(true)
  }

  function deleteSubject() {
    if (!deleteCode) return
    setSubjects((current) => current.filter((item) => item.code !== deleteCode))
    setDeleteCode(null)
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Academic Setup</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Subject Management
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Manage subjects used for marks, analytics and reports.
          </p>
        </div>

        <Button
          className="gap-2"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="size-4" />
          Add Subject
        </Button>
      </div>

      <Card className="glass max-w-sm">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">Total Subjects</p>
            <p className="mt-1 text-3xl font-semibold">{subjects.length}</p>
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
              {editingCode ? "Edit Subject" : "Add Subject"}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Subject code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-11"
            />

            <Input
              placeholder="Subject name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />

            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3"
            >
              <option>Grade 9</option>
              <option>Grade 10</option>
              <option>Grade 11</option>
            </select>

            <Input
              type="number"
              placeholder="Maximum mark"
              value={maxMark}
              onChange={(e) => setMaxMark(e.target.value)}
              className="h-11"
            />

            <div className="flex gap-3 md:col-span-4">
              <Button onClick={saveSubject}>
                {editingCode ? "Update Subject" : "Save Subject"}
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
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg">Subject List</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subjects..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190">
              <thead className="border-y bg-muted/50">
                <tr>
                  <th className="px-5 py-3 text-left">Code</th>
                  <th className="px-5 py-3 text-left">Subject</th>
                  <th className="px-5 py-3 text-left">Class</th>
                  <th className="px-5 py-3 text-left">Max Mark</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filtered.map((item) => (
                  <tr key={item.code} className="hover:bg-muted/30">
                    <td className="px-5 py-4 font-medium">{item.code}</td>
                    <td className="px-5 py-4">{item.name}</td>
                    <td className="px-5 py-4">{item.className}</td>
                    <td className="px-5 py-4">{item.maxMark}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => editSubject(item)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteCode(item.code)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteCode !== null}
        onOpenChange={(open) => !open && setDeleteCode(null)}
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSubject}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete Subject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}