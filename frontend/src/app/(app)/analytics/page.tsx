"use client"

import { useState } from "react"
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const subjectPerformance = [
  { subject: "Mathematics", average: 78 },
  { subject: "Science", average: 71 },
  { subject: "English", average: 82 },
  { subject: "ICT", average: 86 },
  { subject: "History", average: 66 },
]

const weakStudents = [
  { name: "Sahan Kumara", id: "ST004", average: 49, trend: "Declining" },
  { name: "Nethmi Perera", id: "ST018", average: 52, trend: "Declining" },
  { name: "Kasun Silva", id: "ST027", average: 54, trend: "Stable" },
]

export default function AnalyticsPage() {
  const [className, setClassName] = useState("Grade 10-A")
  const [exam, setExam] = useState("First Term Examination")
  const [subject, setSubject] = useState("All Subjects")

  return (
    <div className="space-y-7">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">
          Performance
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Performance Analytics
        </h1>

        <p className="mt-1 text-base text-muted-foreground">
          Compare academic performance and identify students requiring support.
        </p>
      </div>

      <Card className="glass">
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Class</label>
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
            <label className="text-sm font-medium">Examination</label>
            <select
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
            >
              <option>First Term Examination</option>
              <option>Mid Year Examination</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
            >
              <option>All Subjects</option>
              <option>Mathematics</option>
              <option>Science</option>
              <option>English</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Class Average", "78.4%", TrendingUp],
          ["Pass Rate", "92.1%", Users],
          ["Highest Average", "86.0%", BarChart3],
          ["Needs Attention", "3", TriangleAlert],
        ].map(([title, value, Icon]) => (
          <Card key={title as string} className="glass">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  {title as string}
                </p>
                <p className="mt-1 text-3xl font-semibold">
                  {value as string}
                </p>
              </div>

              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">
              Subject Performance
            </CardTitle>
            <CardDescription>
              Average marks by subject
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {subjectPerformance.map((item) => (
              <div key={item.subject}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">{item.subject}</span>
                  <span className="text-muted-foreground">
                    {item.average}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${item.average}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">
              Grade Distribution
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-4">
            {[
              ["A", "32%"],
              ["B", "26%"],
              ["C", "20%"],
              ["S", "14%"],
              ["F", "8%"],
            ].map(([grade, value]) => (
              <div
                key={grade}
                className="rounded-xl border bg-background/40 p-4 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Grade {grade}
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="glass overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">
            Students Requiring Attention
          </CardTitle>
          <CardDescription>
            Students below the selected performance threshold
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <table className="w-full min-w-162.5">
            <thead className="border-y bg-muted/50">
              <tr>
                <th className="px-5 py-3 text-left">Student</th>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Average</th>
                <th className="px-5 py-3 text-left">Trend</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {weakStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-5 py-4 font-medium">
                    {student.name}
                  </td>
                  <td className="px-5 py-4">{student.id}</td>
                  <td className="px-5 py-4 text-destructive">
                    {student.average}%
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-sm">
                      {student.trend === "Declining" ? (
                        <TrendingDown className="size-4 text-destructive" />
                      ) : (
                        <TrendingUp className="size-4 text-muted-foreground" />
                      )}
                      {student.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}