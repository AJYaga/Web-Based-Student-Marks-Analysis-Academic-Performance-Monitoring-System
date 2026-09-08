const API_URL =
  process.env.NEXT_PUBLIC_API_URL

export type AnalyticsData = {
  context: {
    classId: string
    className: string

    examinationId: string
    examinationName: string

    previousExaminationName:
      | string
      | null

    subjectId: string
    subjectName: string
  }

  summary: {
    classAverage: number
    passRate: number
    highestAverage: number
    needsAttention: number
  }

  subjectPerformance: {
    id: string
    code: string
    subject: string
    average: number
  }[]

  gradeDistribution: {
    grade: string
    value: number
  }[]

  weakStudents: {
    id: string
    registrationNo: string
    name: string
    average: number
    trend:
      | "Improving"
      | "Declining"
      | "Stable"
  }[]
}

type AnalyticsResponse =
  AnalyticsData & {
    success: boolean
  }

export async function getAnalytics(
  classId: string,
  examinationId: string,
  subjectId: string
) {
  const query =
    new URLSearchParams({
      classId,
      examinationId,
      subjectId,
    })

  const response = await fetch(
    `${API_URL}/analytics?${query.toString()}`,
    {
      credentials: "include",
    }
  )

  const data =
    await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to retrieve analytics"
    )
  }

  return data as AnalyticsResponse
}