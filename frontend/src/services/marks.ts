const API_URL =
  process.env.NEXT_PUBLIC_API_URL

export type MarksContext = {
  classId: string
  className: string
  academicYear: number

  examinationId: string
  examinationName: string

  subjectId: string
  subjectName: string
  subjectCode: string

  maxMark: number
  passMark: number
}

export type StudentMarkRecord = {
  studentId: string
  registrationNo: string
  name: string

  marksObtained: number | null
  isAbsent: boolean

  percentage: number | null
  grade: string | null
  passed: boolean | null
  status: string | null
}

type MarksResponse = {
  success: boolean
  context: MarksContext
  students: StudentMarkRecord[]
}

type SaveMarksResponse = {
  success: boolean
  message: string
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong"
    )
  }

  return data
}

export function getMarks(
  classId: string,
  examinationId: string,
  subjectId: string
) {
  const query = new URLSearchParams({
    classId,
    examinationId,
    subjectId,
  })

  return request<MarksResponse>(
    `/marks?${query.toString()}`
  )
}

export function saveMarks(data: {
  classId: string
  examinationId: string
  subjectId: string

  marks: {
    studentId: string
    marksObtained: number | null
    isAbsent: boolean
  }[]
}) {
  return request<SaveMarksResponse>(
    "/marks",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  )
}