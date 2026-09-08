const API_URL =
  process.env.NEXT_PUBLIC_API_URL

export type DashboardData = {
  summary: {
    totalClasses: number
    totalStudents: number
    totalSubjects: number
    totalExaminations: number
    overallAverage: number
    passRate: number
    needsAttention: number
  }

  studentsNeedingAttention: {
    id: string
    registrationNo: string
    name: string
    average: number
  }[]

  gradeDistribution: {
    grade: string
    value: number
  }[]

  performanceTrend: {
    id: string
    name: string
    term: string
    date: string
    average: number | null
  }[]
}

type DashboardResponse = {
  success: boolean
  summary: DashboardData["summary"]
  studentsNeedingAttention:
    DashboardData["studentsNeedingAttention"]
  gradeDistribution:
    DashboardData["gradeDistribution"]
  performanceTrend:
    DashboardData["performanceTrend"]
}

export async function getDashboard() {
  const response = await fetch(
    `${API_URL}/dashboard`,
    {
      credentials: "include",
    }
  )

  const data =
    await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to retrieve dashboard data"
    )
  }

  return data as DashboardResponse
}