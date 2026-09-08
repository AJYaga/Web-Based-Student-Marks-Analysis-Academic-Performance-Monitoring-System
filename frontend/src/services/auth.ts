export const TEACHER_PROFILE_UPDATED_EVENT =
  "eduinsight:teacher-profile-updated"

export function notifyTeacherProfileUpdated(
  teacher: Teacher
) {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(
    new CustomEvent<Teacher>(
      TEACHER_PROFILE_UPDATED_EVENT,
      {
        detail: teacher,
      }
    )
  )
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL

export type Teacher = {
  id: string
  name: string
  email: string
  createdAt?: string
}

type AuthResponse = {
  success: boolean
  message?: string
  teacher?: Teacher
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

export function registerTeacher(data: {
  name: string
  email: string
  password: string
}) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function loginTeacher(data: {
  email: string
  password: string
}) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function getCurrentTeacher() {
  return request<AuthResponse>("/auth/me")
}

export function logoutTeacher() {
  return request<AuthResponse>("/auth/logout", {
    method: "POST",
  })
}