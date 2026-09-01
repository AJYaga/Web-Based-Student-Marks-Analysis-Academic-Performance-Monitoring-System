"use client"

import { useState } from "react"
import {
  Download,
  FileText,
  Printer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const results = [
  ["Mathematics", 82, "A"],
  ["Science", 76, "A"],
  ["English", 72, "B"],
  ["ICT", 88, "A"],
  ["History", 68, "B"],
]

export default function ReportsPage() {
  const [student, setStudent] = useState("Nimal Perera")
  const [exam, setExam] = useState("First Term Examination")

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
          Preview and prepare student academic reports.
        </p>
      </div>

      <Card className="glass">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Student</label>

            <select
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
            >
              <option>Nimal Perera</option>
              <option>Kavindu Silva</option>
              <option>Amaya Fernando</option>
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

      <Card className="glass-strong mx-auto max-w-4xl">
        <CardHeader className="border-b text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-6" />
          </div>

          <CardTitle className="text-2xl">
            EduInsight Academic Report
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            {exam}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 rounded-xl bg-muted/40 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Student
              </p>
              <p className="font-semibold">{student}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Student ID
              </p>
              <p className="font-semibold">ST001</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Class
              </p>
              <p className="font-semibold">Grade 10-A</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Marks</th>
                  <th className="px-4 py-3 text-left">Grade</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {results.map(([subjectName, mark, grade]) => (
                  <tr key={subjectName}>
                    <td className="px-4 py-3 font-medium">
                      {subjectName}
                    </td>
                    <td className="px-4 py-3">{mark}</td>
                    <td className="px-4 py-3">{grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Average
              </p>
              <p className="text-2xl font-semibold">77.2%</p>
            </div>

            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Overall Grade
              </p>
              <p className="text-2xl font-semibold">A</p>
            </div>

            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Status
              </p>
              <p className="text-2xl font-semibold text-secondary-foreground">
                Pass
              </p>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold">
              Teacher Remarks
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Good academic performance. Continue maintaining consistent
              effort across all subjects.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          Print
        </Button>

        <Button className="gap-2">
          <Download className="size-4" />
          Export PDF
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        PDF export will connect to the backend report service later.
      </p>
    </div>
  )
}