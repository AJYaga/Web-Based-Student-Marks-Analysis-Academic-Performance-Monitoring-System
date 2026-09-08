const API_URL =
  process.env.NEXT_PUBLIC_API_URL

export type ExaminationSubjectRecord = {
  id: string
  code: string
  name: string
  maxMark: number
  passMark: number
}

export type ExaminationRecord = {
  id: string
  name: string
  term: string
  academicYear: number
  date: string
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED"
  classId: string
  className: string
  subjects: ExaminationSubjectRecord[]
}

type ExaminationsResponse = {
  success: boolean
  examinations: ExaminationRecord[]
}

type ExaminationResponse = {
  success: boolean
  message?: string
  examination?: ExaminationRecord
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    )
  }

  return data
}

export function getExaminations() {
  return request<ExaminationsResponse>(
    "/examinations"
  )
}

export function createExamination(data: {
  name: string
  term: string
  date: string
  classId: string
  subjectIds: string[]
}) {
  return request<ExaminationResponse>(
    "/examinations",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  )
}

export function updateExamination(
  id: string,
  data: {
    name: string
    term: string
    date: string
    classId: string
    subjectIds: string[]
  }
) {
  return request<ExaminationResponse>(
    `/examinations/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  )
}

export function deleteExamination(id: string) {
  return request<ExaminationResponse>(
    `/examinations/${id}`,
    {
      method: "DELETE",
    }
  )
}