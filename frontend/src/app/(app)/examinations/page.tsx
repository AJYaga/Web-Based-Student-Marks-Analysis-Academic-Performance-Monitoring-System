"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Pencil, Plus, Search, Trash2 } from "lucide-react"

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

const initialExams = [
  { id: "EX001", name: "First Term Examination", date: "2026-03-20", className: "Grade 10-A", term: "Term 1" },
  { id: "EX002", name: "Mid Year Examination", date: "2026-07-15", className: "Grade 10-A", term: "Term 2" },
]

function formatDate(value: string) {
  if (!value) return "Select examination date"

  const [year, month, day] = value.split("-").map(Number)

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function ExaminationsPage() {
  const [exams, setExams] = useState(initialExams)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [className, setClassName] = useState("Grade 10-A")
  const [term, setTerm] = useState("Term 1")

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return exams

    return exams.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.className.toLowerCase().includes(q)
    )
  }, [exams, search])

  function resetForm() {
    setName("")
    setDate("")
    setClassName("Grade 10-A")
    setTerm("Term 1")
    setEditingId(null)
  }

  function saveExam() {
    if (!name.trim() || !date) return

    if (editingId) {
      setExams((current) =>
        current.map((item) =>
          item.id === editingId
            ? { ...item, name, date, className, term }
            : item
        )
      )
    } else {
      setExams((current) => [
        ...current,
        {
          id: `EX${String(current.length + 1).padStart(3, "0")}`,
          name,
          date,
          className,
          term,
        },
      ])
    }

    resetForm()
    setShowForm(false)
  }

  function editExam(item: (typeof initialExams)[number]) {
    setEditingId(item.id)
    setName(item.name)
    setDate(item.date)
    setClassName(item.className)
    setTerm(item.term)
    setShowForm(true)
  }

  function deleteExam() {
    if (!deleteId) return
    setExams((current) => current.filter((item) => item.id !== deleteId))
    setDeleteId(null)
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Academic Setup</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Examination Management
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Create and maintain examination records.
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
          Add Examination
        </Button>
      </div>

      <Card className="glass max-w-sm">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">Total Examinations</p>
            <p className="mt-1 text-3xl font-semibold">{exams.length}</p>
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
              {editingId ? "Edit Examination" : "Add Examination"}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Examination name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />

            <Popover>
                <PopoverTrigger
                    render={
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full justify-start gap-2 px-3 font-normal"
                    />
                    }
                >
                    <CalendarDays className="size-4 text-muted-foreground" />

                    <span className={!date ? "text-muted-foreground" : ""}>
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
                                const [year, month, day] = date.split("-").map(Number)
                                return new Date(year, month - 1, day)
                                })()
                            : undefined
                        }
                        onSelect={(selectedDate) => {
                            if (!selectedDate) return

                            const year = selectedDate.getFullYear()
                            const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
                            const day = String(selectedDate.getDate()).padStart(2, "0")

                            setDate(`${year}-${month}-${day}`)
                        }}
                    />
                </PopoverContent>
            </Popover>

            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3"
            >
              <option>Grade 10-A</option>
              <option>Grade 10-B</option>
              <option>Grade 11-A</option>
            </select>

            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3"
            >
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Term 3</option>
            </select>

            <div className="flex gap-3 md:col-span-4">
              <Button onClick={saveExam}>
                {editingId ? "Update Examination" : "Save Examination"}
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
            <CardTitle className="text-lg">Examination List</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search examinations..."
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
                  <th className="px-5 py-3 text-left">Examination</th>
                  <th className="px-5 py-3 text-left">Class</th>
                  <th className="px-5 py-3 text-left">Term</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-5 py-4 font-medium">{item.name}</td>
                    <td className="px-5 py-4">{item.className}</td>
                    <td className="px-5 py-4">{item.term}</td>
                    <td className="px-5 py-4">{item.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => editExam(item)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
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
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteExam}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete Examination
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}