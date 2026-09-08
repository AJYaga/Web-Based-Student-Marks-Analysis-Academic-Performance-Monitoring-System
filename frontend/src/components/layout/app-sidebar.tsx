"use client"

import Image from "next/image"
import Link from "next/link"
import {
  usePathname,
  useRouter,
} from "next/navigation"
import { logoutTeacher } from "@/services/auth"
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const mainNavigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
]

const academicNavigation = [
  {
    title: "Classes",
    url: "/classes",
    icon: GraduationCap,
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
  },
  {
    title: "Subjects",
    url: "/subjects",
    icon: BookOpen,
  },
  {
    title: "Examinations",
    url: "/examinations",
    icon: ClipboardList,
  },
]

const workNavigation = [
  {
    title: "Marks",
    url: "/marks",
    icon: ClipboardList,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    try {
      await logoutTeacher()
    } finally {
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Image
                src="/images/logo/EduInsight.png"
                alt="EduInsight logo"
                width={44}
                height={44}
                className="size-10 object-contain"
                priority
            />
          </div>

          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-lg font-semibold tracking-tight">
              EduInsight
            </p>
            <p className="truncate text-sm text-muted-foreground">
              Academic Performance
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[13px] font-semibold">
            Workspace
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      className="h-10 text-[15px]"
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[13px] font-semibold">
            Academic Setup
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {academicNavigation.map((item) => {
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      className="h-10 text-[15px]"
                      isActive={pathname.startsWith(item.url)}
                      tooltip={item.title}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[13px] font-semibold">
            Performance
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {workNavigation.map((item) => {
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      className="h-10 text-[15px]"
                      isActive={pathname.startsWith(item.url)}
                      tooltip={item.title}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-10 text-[15px] text-destructive hover:bg-destructive/10 hover:text-destructive"
              tooltip="Logout"
              onClick={handleLogout}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/settings" />}
              className="h-10 text-[15px]"
              isActive={pathname.startsWith("/settings")}
              tooltip="Settings"
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}