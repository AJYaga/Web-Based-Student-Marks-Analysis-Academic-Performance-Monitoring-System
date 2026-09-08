"use client"

import Link from "next/link"
import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ClipboardPenLine,
  FileText,
  Loader2,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react"

import {
  getDashboard,
  type DashboardData,
} from "@/services/dashboard"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const quickActions = [
  {
    title: "Enter Marks",
    description:
      "Record examination results",
    href: "/marks",
    icon: ClipboardPenLine,
  },
  {
    title: "View Analytics",
    description:
      "Analyze student performance",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Generate Report",
    description:
      "Create student reports",
    href: "/reports",
    icon: FileText,
  },
]

function chartPoints(
  values: number[]
) {
  if (values.length === 0) {
    return ""
  }

  if (values.length === 1) {
    return `20,${190 - values[0] * 1.5}`
  }

  const width = 560
  const startX = 20

  return values
    .map((value, index) => {
      const x =
        startX +
        (index /
          (values.length - 1)) *
          width

      const y =
        205 -
        Math.max(
          0,
          Math.min(100, value)
        ) *
          1.55

      return `${x},${y}`
    })
    .join(" ")
}

export default function DashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(
      null
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        const response =
          await getDashboard()

        if (cancelled) return

        setData(response)
      } catch (error) {
        if (cancelled) return

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard."
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  const summaryCards = useMemo(() => {
    if (!data) return []

    return [
      {
        title: "Total Students",
        value:
          String(
            data.summary
              .totalStudents
          ),
        description:
          "Active students",
        icon: Users,
      },

      {
        title: "Class Average",
        value:
          `${data.summary.overallAverage.toFixed(
            1
          )}%`,
        description:
          "Across recorded marks",
        icon: TrendingUp,
      },

      {
        title: "Pass Rate",
        value:
          `${data.summary.passRate.toFixed(
            1
          )}%`,
        description:
          "Across recorded marks",
        icon: BookOpenCheck,
      },

      {
        title:
          "Needs Attention",
        value:
          String(
            data.summary
              .needsAttention
          ),
        description:
          "Students below 40%",
        icon: TriangleAlert,
      },
    ]
  }, [data])

  const trendValues =
    data?.performanceTrend
      .map((item) =>
        item.average ?? 0
      ) ?? []

  const points =
    chartPoints(trendValues)

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Loading dashboard...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error ||
          "Unable to load dashboard."}
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            Overview
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-1 text-base text-muted-foreground">
            Monitor your students&apos;
            academic performance at a
            glance.
          </p>
        </div>

        <Button
          render={
            <Link href="/marks" />
          }
          nativeButton={false}
          className="h-10 gap-2 self-start lg:self-auto"
        >
          <ClipboardPenLine className="size-4" />
          Enter Marks
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(
          (card) => {
            const Icon =
              card.icon

            return (
              <Card
                key={card.title}
                className="glass interactive overflow-hidden"
              >
                <CardContent className="flex items-start justify-between p-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>

                    <p className="mt-2 text-3xl font-semibold tracking-tight">
                      {card.value}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {
                        card.description
                      }
                    </p>
                  </div>

                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                </CardContent>
              </Card>
            )
          }
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <Card className="glass">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  Performance Trend
                </CardTitle>

                <CardDescription className="mt-1">
                  Average performance
                  across recent
                  examinations
                </CardDescription>
              </div>

              <Button
                variant="ghost"
                size="sm"
                render={
                  <Link href="/analytics" />
                }
                nativeButton={false}
                className="gap-1"
              >
                Details
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {data.performanceTrend
              .length === 0 ? (
              <div className="flex h-70 items-center justify-center rounded-xl border bg-background/40 text-sm text-muted-foreground">
                No examination results
                available yet.
              </div>
            ) : (
              <div className="relative h-70 overflow-hidden rounded-xl border bg-background/40 p-5">
                <div className="absolute inset-x-5 top-[20%] border-t border-dashed border-border/60" />
                <div className="absolute inset-x-5 top-[40%] border-t border-dashed border-border/60" />
                <div className="absolute inset-x-5 top-[60%] border-t border-dashed border-border/60" />
                <div className="absolute inset-x-5 top-[80%] border-t border-dashed border-border/60" />

                <svg
                  viewBox="0 0 600 220"
                  className="relative z-10 h-full w-full overflow-visible"
                  role="img"
                  aria-label="Average performance trend"
                >
                  <polyline
                    points={points}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  />

                  {trendValues.map(
                    (value, index) => {
                      const count =
                        trendValues.length

                      const x =
                        count === 1
                          ? 20
                          : 20 +
                            (index /
                              (count -
                                1)) *
                              560

                      const y =
                        205 -
                        Math.max(
                          0,
                          Math.min(
                            100,
                            value
                          )
                        ) *
                          1.55

                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r="7"
                          fill="currentColor"
                          className="text-primary"
                        />
                      )
                    }
                  )}
                </svg>

                <div className="absolute inset-x-6 bottom-3 flex justify-between gap-2 text-xs text-muted-foreground">
                  {data.performanceTrend.map(
                    (item) => (
                      <span
                        key={item.id}
                        className="truncate"
                      >
                        {item.term}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">
              Grade Distribution
            </CardTitle>

            <CardDescription>
              All recorded examination
              results
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {data.gradeDistribution.map(
              (item) => (
                <div
                  key={item.grade}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      Grade {item.grade}
                    </span>

                    <span className="text-muted-foreground">
                      {item.value.toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          item.value
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  Students Requiring Attention
                </CardTitle>

                <CardDescription>
                  Students currently
                  below 40% average
                </CardDescription>
              </div>

              <TriangleAlert className="size-5 text-destructive" />
            </div>
          </CardHeader>

          <CardContent>
            {data.studentsNeedingAttention
              .length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No students currently
                require attention.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.studentsNeedingAttention.map(
                  (student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                          {student.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {
                              student.name
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              student.registrationNo
                            }
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-destructive/10 px-2.5 py-1 text-sm font-medium text-destructive">
                        {student.average.toFixed(
                          1
                        )}
                        %
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            <Button
              variant="outline"
              render={
                <Link href="/analytics" />
              }
              nativeButton={false}
              className="mt-5 w-full gap-2"
            >
              View Performance Analysis
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">
              Quick Actions
            </CardTitle>

            <CardDescription>
              Frequently used
              EduInsight tasks
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {quickActions.map(
              (action) => {
                const Icon =
                  action.icon

                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group flex items-center gap-4 rounded-xl border bg-background/40 p-4 transition-all duration-150 hover:border-primary/30 hover:bg-accent/50"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {
                          action.title
                        }
                      </p>

                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {
                          action.description
                        }
                      </p>
                    </div>

                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                )
              }
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}