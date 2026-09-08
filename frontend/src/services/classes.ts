const API_URL =
  process.env.NEXT_PUBLIC_API_URL

export type ClassRecord = {
  id: string
  name: string
  level: string
  academicYear: number
  students: number
}

type ClassesResponse = {
  success: boolean
  classes: ClassRecord[]
}

type ClassResponse = {
  success: boolean
  message?: string
  class?: ClassRecord
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
    throw new Error(data.message || "Something went wrong")
  }

  return data
}

export function getClasses() {
  return request<ClassesResponse>("/classes")
}

export function createClass(data: {
  name: string
  level: string
  academicYear: number
}) {
  return request<ClassResponse>("/classes", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateClass(
  id: string,
  data: {
    name: string
    level: string
    academicYear: number
  }
) {
  return request<ClassResponse>(`/classes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export function deleteClass(id: string) {
  return request<ClassResponse>(`/classes/${id}`, {
    method: "DELETE",
  })
}