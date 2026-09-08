const API_URL =
  process.env.NEXT_PUBLIC_API_URL

export type StudentReport = {
  student: {
    id: string
    registrationNo: string
    name: string
    classId: string
    className: string
    academicYear: number
  }

  examination: {
    id: string
    name: string
    term: string
    academicYear: number
    date: string
  }

  results: {
    subjectId: string
    code: string
    subjectName: string
    maxMark: number
    passMark: number
    marksObtained: number | null
    isAbsent: boolean
    percentage: number | null
    grade: string | null
    passed: boolean | null
    entered: boolean
  }[]

  summary: {
    average: number | null
    overallGrade: string | null
    status:
      | "Pass"
      | "Fail"
      | "Incomplete"
    teacherRemark: string
  }
}

type ReportResponse = {
  success: boolean
  report: StudentReport
}

export async function getStudentReport(
  studentId: string,
  examinationId: string
) {
  const query =
    new URLSearchParams({
      studentId,
      examinationId,
    })

  const response = await fetch(
    `${API_URL}/reports/student?${query.toString()}`,
    {
      credentials: "include",
    }
  )

  const data =
    await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to generate report"
    )
  }

  return data as ReportResponse
}