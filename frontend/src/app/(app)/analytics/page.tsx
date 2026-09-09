"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  BarChart3,
  Loader2,
  Minus,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react"

import {
  getClasses,
  type ClassRecord,
} from "@/services/classes"

import {
  getExaminations,
  type ExaminationRecord,
} from "@/services/examinations"

import {
  getAnalytics,
  type AnalyticsData,
} from "@/services/analytics"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AnalyticsPage() {
  const [classes, setClasses] =
    useState<ClassRecord[]>([])

  const [
    examinations,
    setExaminations,
  ] =
    useState<ExaminationRecord[]>(
      []
    )

  const [data, setData] =
    useState<AnalyticsData | null>(
      null
    )

  const [classId, setClassId] =
    useState("")

  const [
    examinationId,
    setExaminationId,
  ] = useState("")

  const [subjectId, setSubjectId] =
    useState("all")

  const [loading, setLoading] =
    useState(true)

  const [
    loadingAnalytics,
    setLoadingAnalytics,
  ] = useState(false)

  const [error, setError] =
    useState("")

  const classExaminations =
    useMemo(
      () =>
        examinations.filter(
          (examination) =>
            examination.classId ===
            classId
        ),
      [examinations, classId]
    )

  const selectedExamination =
    classExaminations.find(
      (examination) =>
        examination.id ===
        examinationId
    )

  const availableSubjects =
    selectedExamination?.subjects ??
    []

  useEffect(() => {
    let cancelled = false

    async function initialLoad() {
      try {
        const [
          classResponse,
          examinationResponse,
        ] = await Promise.all([
          getClasses(),
          getExaminations(),
        ])

        if (cancelled) return

        setClasses(
          classResponse.classes
        )

        setExaminations(
          examinationResponse
            .examinations
        )

        const firstClass =
          classResponse.classes[0]

        if (firstClass) {
          const firstExam =
            examinationResponse
              .examinations.find(
                (exam) =>
                  exam.classId ===
                  firstClass.id
              )

          setClassId(
            firstClass.id
          )

          setExaminationId(
            firstExam?.id ?? ""
          )

          setSubjectId("all")
        }
      } catch (error) {
        if (cancelled) return

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load analytics setup."
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

  useEffect(() => {
    if (
      !classId ||
      !examinationId
    ) {
      return
    }

    let cancelled = false

    async function loadAnalytics() {
      try {
        const response =
          await getAnalytics(
            classId,
            examinationId,
            subjectId
          )

        if (cancelled) return

        setData(response)
        setError("")
      } catch (error) {
        if (cancelled) return

        setData(null)

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load analytics."
        )
      } finally {
        if (!cancelled) {
          setLoadingAnalytics(
            false
          )
        }
      }
    }

    void loadAnalytics()

    return () => {
      cancelled = true
    }
  }, [
    classId,
    examinationId,
    subjectId,
  ])

  function handleClassChange(
    nextClassId: string
  ) {
    const firstExam =
      examinations.find(
        (exam) =>
          exam.classId ===
          nextClassId
      )

    setLoadingAnalytics(true)

    setClassId(nextClassId)

    setExaminationId(
      firstExam?.id ?? ""
    )

    setSubjectId("all")

    setData(null)
    setError("")
  }

  function handleExamChange(
    nextExamId: string
  ) {
    setLoadingAnalytics(true)

    setExaminationId(
      nextExamId
    )

    setSubjectId("all")

    setData(null)
    setError("")
  }

  function handleSubjectChange(
    nextSubjectId: string
  ) {
    setLoadingAnalytics(true)

    setSubjectId(
      nextSubjectId
    )

    setData(null)
    setError("")
  }

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Loading analytics...
      </div>
    )
  }

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
          Compare academic performance
          and identify students
          requiring support.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <Card className="glass">
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="analytics-class"
              className="text-sm font-medium"
            >
              Class
            </label>

            <select
              id="analytics-class"
              value={classId}
              disabled={loadingAnalytics}
              onChange={(e) =>
                handleClassChange(
                  e.target.value
                )
              }
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
            >
              {classes.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name} —{" "}
                    {item.academicYear}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="analytics-examination"
              className="text-sm font-medium"
            >
              Examination
            </label>

            <select
              id="analytics-examination"
              value={examinationId}
              onChange={(e) =>
                handleExamChange(
                  e.target.value
                )
              }
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
              disabled={
                availableSubjects.length === 0 ||
                loadingAnalytics
              }
            >
              {classExaminations.length ===
              0 ? (
                <option value="">
                  No examinations
                </option>
              ) : (
                classExaminations.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  )
                )
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="analytics-subject"
              className="text-sm font-medium"
            >
              Subject
            </label>

            <select
              id="analytics-subject"
              value={subjectId}
              onChange={(e) =>
                handleSubjectChange(
                  e.target.value
                )
              }
              className="h-11 w-full rounded-lg border border-input bg-background px-3"
              disabled={
                availableSubjects.length === 0 ||
                loadingAnalytics
              }
            >
              <option value="all">
                All Subjects
              </option>

              {availableSubjects.map(
                (subject) => (
                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.name}
                  </option>
                )
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      {loadingAnalytics ? (
        <div className="flex min-h-70 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Calculating analytics...
        </div>
      ) : !data ? (
        <Card className="glass">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No analytics data is
            available for the selected
            context.
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title:
                  "Class Average",
                value: `${data.summary.classAverage.toFixed(
                  1
                )}%`,
                Icon:
                  TrendingUp,
              },
              {
                title: "Pass Rate",
                value: `${data.summary.passRate.toFixed(
                  1
                )}%`,
                Icon: Users,
              },
              {
                title:
                  "Highest Average",
                value: `${data.summary.highestAverage.toFixed(
                  1
                )}%`,
                Icon: BarChart3,
              },
              {
                title:
                  "Needs Attention",
                value: String(
                  data.summary
                    .needsAttention
                ),
                Icon:
                  TriangleAlert,
              },
            ].map(
              ({
                title,
                value,
                Icon,
              }) => (
                <Card
                  key={title}
                  className="glass"
                >
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {title}
                      </p>

                      <p className="mt-1 text-3xl font-semibold">
                        {value}
                      </p>
                    </div>

                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">
                  Subject Performance
                </CardTitle>

                <CardDescription>
                  Average marks by
                  subject
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {data.subjectPerformance
                  .length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No subject marks
                    available.
                  </p>
                ) : (
                  data.subjectPerformance.map(
                    (item) => (
                      <div
                        key={item.id}
                      >
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium">
                            {
                              item.subject
                            }
                          </span>

                          <span className="text-muted-foreground">
                            {item.average.toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                item.average,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">
                  Grade Distribution
                </CardTitle>

                <CardDescription>
                  Selected examination
                  results
                </CardDescription>
              </CardHeader>

              <CardContent className="grid grid-cols-2 gap-4">
                {data.gradeDistribution.map(
                  (item) => (
                    <div
                      key={
                        item.grade
                      }
                      className="rounded-xl border bg-background/40 p-4 text-center"
                    >
                      <p className="text-sm text-muted-foreground">
                        Grade{" "}
                        {item.grade}
                      </p>

                      <p className="mt-1 text-2xl font-semibold">
                        {item.value.toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </section>

          <Card className="glass overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">
                Students Requiring
                Attention
              </CardTitle>

              <CardDescription>
                Students below 40%
                average in the selected
                context
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {data.weakStudents
                .length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No students currently
                  require attention.
                </div>
              ) : (
                <div className="overflow-x-auto overscroll-x-contain">
                  <table className="w-full min-w-162.5">
                    <thead className="sticky top-0 z-10 border-y bg-muted/90 backdrop-blur">
                      <tr>
                        <th className="px-5 py-3 text-left">
                          Student
                        </th>

                        <th className="px-5 py-3 text-left">
                          ID
                        </th>

                        <th className="px-5 py-3 text-left">
                          Average
                        </th>

                        <th className="px-5 py-3 text-left">
                          Trend
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {data.weakStudents.map(
                        (
                          student
                        ) => (
                          <tr
                            key={
                              student.id
                            }
                          >
                            <td className="px-5 py-4 font-medium">
                              {
                                student.name
                              }
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              {
                                student.registrationNo
                              }
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-destructive">
                              {student.average.toFixed(
                                1
                              )}
                              %
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <span className="inline-flex items-center gap-1 text-sm">
                                {student.trend ===
                                "Declining" ? (
                                  <TrendingDown
                                    aria-hidden="true"
                                    className="size-4 text-destructive"
                                  />  
                                ) : student.trend ===
                                  "Improving" ? (
                                  <TrendingUp 
                                    aria-hidden="true"
                                    className="size-4 text-primary" 
                                  />
                                ) : (
                                  <Minus 
                                    aria-hidden="true"
                                    className="size-4 text-muted-foreground" 
                                  />
                                )}

                                {
                                  student.trend
                                }
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}