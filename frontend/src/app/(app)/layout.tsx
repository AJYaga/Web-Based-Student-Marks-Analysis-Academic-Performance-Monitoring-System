import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

async function verifyAuthentication() {
  const cookieStore = await cookies()

  const token = cookieStore.get("eduinsight_token")

  if (!token) {
    redirect("/login")
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `eduinsight_token=${token.value}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      redirect("/login")
    }
  } catch {
    redirect("/login")
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await verifyAuthentication()

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppHeader />

        <div className="flex flex-1 flex-col p-5 md:p-7 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}