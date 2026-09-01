import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ClipboardPenLine,
  FileText,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const summaryCards = [
  {
    title: "Total Students",
    value: "40",
    description: "Active students",
    icon: Users,
  },
  {
    title: "Class Average",
    value: "78.4%",
    description: "Current examination",
    icon: TrendingUp,
  },
  {
    title: "Pass Rate",
    value: "92.1%",
    description: "Across all subjects",
    icon: BookOpenCheck,
  },
  {
    title: "Needs Attention",
    value: "4",
    description: "Students below threshold",
    icon: TriangleAlert,
  },
]

const quickActions = [
  {
    title: "Enter Marks",
    description: "Record examination results",
    href: "/marks",
    icon: ClipboardPenLine,
  },
  {
    title: "View Analytics",
    description: "Analyze student performance",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Generate Report",
    description: "Create student reports",
    href: "/reports",
    icon: FileText,
  },
]

const studentsNeedingAttention = [
  {
    name: "N. Perera",
    id: "ST018",
    average: "46%",
  },
  {
    name: "S. Kumara",
    id: "ST027",
    average: "49%",
  },
  {
    name: "A. Silva",
    id: "ST032",
    average: "51%",
  },
  {
    name: "D. Fernando",
    id: "ST038",
    average: "53%",
  },
]

const gradeDistribution = [
  { grade: "A", value: 32 },
  { grade: "B", value: 26 },
  { grade: "C", value: 20 },
  { grade: "S", value: 14 },
  { grade: "F", value: 8 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            Overview
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-1 text-base text-muted-foreground">
            Monitor your students&apos; academic performance at a glance.
          </p>
        </div>

        <Button
            render={<Link href="/marks" />}
            nativeButton={false}
            className="h-10 gap-2 self-start lg:self-auto"
        >
          <ClipboardPenLine className="size-4" />
          Enter Marks
        </Button>
      </div>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon

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
                    {card.description}
                  </p>
                </div>

                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      {/* Main analytics row */}
      <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        {/* Performance Trend */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  Performance Trend
                </CardTitle>

                <CardDescription className="mt-1">
                  Average class performance across recent examinations
                </CardDescription>
              </div>

              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/analytics" />}
                nativeButton={false}
                className="gap-1"
              >
                Details
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="relative h-70 overflow-hidden rounded-xl border bg-background/40 p-5">
              {/* Horizontal grid */}
              <div className="absolute inset-x-5 top-[20%] border-t border-dashed border-border/60" />
              <div className="absolute inset-x-5 top-[40%] border-t border-dashed border-border/60" />
              <div className="absolute inset-x-5 top-[60%] border-t border-dashed border-border/60" />
              <div className="absolute inset-x-5 top-[80%] border-t border-dashed border-border/60" />

              {/* Simple visual trend */}
              <svg
                viewBox="0 0 600 220"
                className="relative z-10 h-full w-full overflow-visible"
                role="img"
                aria-label="Performance trend showing gradual improvement"
              >
                <defs>
                  <linearGradient
                    id="performanceGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="currentColor"
                      stopOpacity="0.28"
                    />
                    <stop
                      offset="100%"
                      stopColor="currentColor"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M20 170 C100 150, 120 160, 180 132 S285 120, 340 102 S440 118, 490 77 S555 68, 580 50 L580 205 L20 205 Z"
                  fill="url(#performanceGradient)"
                  className="text-primary"
                />

                <path
                  d="M20 170 C100 150, 120 160, 180 132 S285 120, 340 102 S440 118, 490 77 S555 68, 580 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="text-primary"
                />

                {[
                  [20, 170],
                  [180, 132],
                  [340, 102],
                  [490, 77],
                  [580, 50],
                ].map(([cx, cy], index) => (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r="7"
                    fill="currentColor"
                    className="text-primary"
                  />
                ))}
              </svg>

              <div className="absolute inset-x-6 bottom-3 flex justify-between text-xs text-muted-foreground">
                <span>Term 1</span>
                <span>Mid Term</span>
                <span>Term 2</span>
                <span>Term 3</span>
                <span>Final</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grade distribution */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">
              Grade Distribution
            </CardTitle>

            <CardDescription>
              Current examination results
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {gradeDistribution.map((item) => (
              <div key={item.grade} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Grade {item.grade}
                  </span>

                  <span className="text-muted-foreground">
                    {item.value}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{
                      width: `${item.value}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Bottom row */}
      <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* Students requiring attention */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  Students Requiring Attention
                </CardTitle>

                <CardDescription>
                  Students currently below the selected performance threshold
                </CardDescription>
              </div>

              <TriangleAlert className="size-5 text-destructive" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="divide-y divide-border">
              {studentsNeedingAttention.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {student.name.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {student.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {student.id}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-destructive/10 px-2.5 py-1 text-sm font-medium text-destructive">
                    {student.average}
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              render={<Link href="/analytics" />}
              nativeButton={false}
              className="mt-5 w-full gap-2"
            >
              View Performance Analysis
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">
              Quick Actions
            </CardTitle>

            <CardDescription>
              Frequently used EduInsight tasks
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon

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
                      {action.title}
                    </p>

                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>

                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}