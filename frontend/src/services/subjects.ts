const API_URL =
  process.env.NEXT_PUBLIC_API_URL

export type SubjectRecord = {
  id: string
  code: string
  name: string
  maxMark: number
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED"
  classId: string | null
  className: string
  academicYear: number | null
}

type SubjectsResponse = {
  success: boolean
  subjects: SubjectRecord[]
}

type SubjectResponse = {
  success: boolean
  message?: string
  subject?: SubjectRecord
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
      data.message || "Something went wrong"
    )
  }

  return data
}

export function getSubjects() {
  return request<SubjectsResponse>(
    "/subjects"
  )
}

export function createSubject(data: {
  code: string
  name: string
  maxMark: number
  classId: string
}) {
  return request<SubjectResponse>(
    "/subjects",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  )
}

export function updateSubject(
  id: string,
  data: {
    code: string
    name: string
    maxMark: number
    classId: string
  }
) {
  return request<SubjectResponse>(
    `/subjects/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  )
}

export function deleteSubject(
  id: string
) {
  return request<SubjectResponse>(
    `/subjects/${id}`,
    {
      method: "DELETE",
    }
  )
}