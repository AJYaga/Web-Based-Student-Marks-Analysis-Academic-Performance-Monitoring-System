"use client"
 
import { useState, useEffect, useRef } from "react"
import { Search, User, LogOut } from "lucide-react"
 
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { useRouter } from "next/navigation"
import {
  getCurrentTeacher,
  logoutTeacher,
  TEACHER_PROFILE_UPDATED_EVENT,
  type Teacher,
} from "@/services/auth"
 
export function AppHeader() {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const [teacher, setTeacher] =
  useState<Teacher | null>(null)
 
  useEffect(() => {
    let active = true

    async function loadTeacher() {
      try {
        const response =
          await getCurrentTeacher()

        if (active && response.teacher) {
          setTeacher(response.teacher)
        }
      } catch {
        if (active) {
          router.replace("/login")
        }
      }
    }

    loadTeacher()

    return () => {
      active = false
    }
  }, [router])

  useEffect(() => {
    function handleProfileUpdate(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<Teacher>

      setTeacher(
        customEvent.detail
      )
    }

    window.addEventListener(
      TEACHER_PROFILE_UPDATED_EVENT,
      handleProfileUpdate
    )

    return () => {
      window.removeEventListener(
        TEACHER_PROFILE_UPDATED_EVENT,
        handleProfileUpdate
      )
    }
  }, [])
  
  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false)
      }
    }
 
    document.addEventListener("mousedown", handleClickOutside)
 
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  async function handleLogout() {
    try {
      await logoutTeacher()
    } finally {
      setProfileOpen(false)
      router.replace("/login")
      router.refresh()
    }
  }
 
  return (
<header className="sticky top-0 z-20 flex h-18 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl md:px-6">
      {/* Sidebar */}
<SidebarTrigger />
 
      <div className="hidden h-5 w-px bg-border sm:block" />
 
      {/* App Title */}
<div className="min-w-0 flex-1">
<p className="truncate text-base font-medium text-foreground">
          EduInsight
</p>
 
        <p className="hidden truncate text-sm text-muted-foreground sm:block">
          Academic Performance Monitoring
</p>
</div>
 
      {/* Search */}
<div className="hidden w-full max-w-xs md:block">
<div className="relative">
<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
 
          <Input
            type="search"
            placeholder="Search..."
            className="h-9 bg-background/70 pl-9"
            aria-label="Search EduInsight"
          />
</div>
</div>
 
      {/* Theme Toggle */}
<ThemeToggle />
 
      {/* Profile */}
<div ref={profileRef} className="relative">
<Button
          variant="ghost"
          className="size-9 rounded-full p-0"
          aria-label="Open profile menu"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((prev) => !prev)}
>
<span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {teacher?.name?.charAt(0).toUpperCase()}
</span>
</Button>
 
        {/* Profile Dropdown */}
        {profileOpen && (
<div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
 
            {/* User Information */}
<div className="border-b border-border px-4 py-4">
<div className="flex items-center gap-3">
 
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {teacher?.name?.charAt(0).toUpperCase()}
</div>
 
                <div className="min-w-0">
<p className="truncate text-sm font-semibold text-foreground">
                    {teacher?.name}
</p>
 
                  <p className="truncate text-xs text-muted-foreground">
                    {teacher?.email}
</p>
</div>
 
              </div>
</div>
 
            {/* Menu Items */}
<div className="p-2">
 
              {/* View Profile */}
<button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                onClick={() => {
                  setProfileOpen(false)
                  router.push("/settings")
                }}
>
<User className="size-4 text-muted-foreground" />
<span>View Profile</span>
</button>
 
              {/* Logout */}
<button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                onClick={handleLogout}
>
<LogOut className="size-4" />
<span>Logout</span>
</button>
 
            </div>
</div>
        )}
</div>
 
    </header>
  )
}