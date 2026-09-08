const API_URL =
  process.env.NEXT_PUBLIC_API_URL

export type TeacherProfile = {
  id: string
  name: string
  email: string
  createdAt: string
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
        "Content-Type":
          "application/json",
        ...options.headers,
      },
    }
  )

  const data =
    await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong"
    )
  }

  return data
}

export function getProfile() {
  return request<{
    success: boolean
    teacher: TeacherProfile
  }>("/settings/profile")
}

export function updateProfile(data: {
  name: string
  email: string
}) {
  return request<{
    success: boolean
    message: string
    teacher: TeacherProfile
  }>("/settings/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export function changePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  return request<{
    success: boolean
    message: string
  }>("/settings/password", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}