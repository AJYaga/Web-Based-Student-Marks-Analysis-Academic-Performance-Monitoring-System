const API_URL =
  process.env.NEXT_PUBLIC_API_URL

export type StudentRecord = {
  id: string
  registrationNo: string
  name: string
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED"
  classId: string
  className: string
  academicYear: number
  average: number | null
  needsAttention: boolean
}

type StudentsResponse = {
  success: boolean
  students: StudentRecord[]
}

type StudentResponse = {
  success: boolean
  message?: string
  student?: StudentRecord
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

export function getStudents() {
  return request<StudentsResponse>("/students")
}

export function createStudent(data: {
  registrationNo: string
  name: string
  classId: string
}) {
  return request<StudentResponse>("/students", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateStudent(
  id: string,
  data: {
    registrationNo: string
    name: string
    classId: string
  }
) {
  return request<StudentResponse>(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export function deleteStudent(id: string) {
  return request<StudentResponse>(`/students/${id}`, {
    method: "DELETE",
  })
}