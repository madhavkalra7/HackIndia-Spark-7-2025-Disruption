"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Menu, X, Bell, Sun, Moon, LogOut, CheckCircle } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "./auth-provider"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Browse Jobs", href: "/browse-jobs" },
  { name: "Post a Job", href: "/post-job" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
]

interface Notification {
  id: number
  userId: string
  message: string
  type: string
  jobId?: number
  read: boolean
  date: string
}

export default function Navbar() {
  const pathname = usePathname()
  const { setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Load notifications
  useEffect(() => {
    if (!user) return

    // Load notifications from localStorage
    const loadNotifications = () => {
      const storedNotifications = localStorage.getItem("job_shield_notifications")
      if (storedNotifications) {
        const allNotifications: Notification[] = JSON.parse(storedNotifications)
        // Filter notifications for this user
        const userNotifications = allNotifications.filter((notification) => notification.userId === user.id)

        setNotifications(userNotifications)
        setUnreadCount(userNotifications.filter((n) => !n.read).length)
      }
    }

    // Initial load
    loadNotifications()

    // Check for new job postings for job seekers
    if (user.userType === "jobseeker") {
      const storedJobs = localStorage.getItem("job_shield_jobs")
      if (storedJobs) {
        const jobs = JSON.parse(storedJobs)
        // Get jobs posted in the last 24 hours
        const now = new Date()
        const recentJobs = jobs.filter((job: any) => {
          if (!job.postedDate.includes("T")) return false
          const jobDate = new Date(job.postedDate)
          const diffTime = Math.abs(now.getTime() - jobDate.getTime())
          const diffHours = diffTime / (1000 * 60 * 60)
          return diffHours < 24
        })

        // Create notifications for recent jobs
        const jobNotifications = recentJobs.map((job: any) => ({
          id: job.id + Date.now(),
          userId: user.id,
          message: `New job posted: ${job.title} at ${job.company}`,
          type: "new_job",
          jobId: job.id,
          read: false,
          date: new Date().toISOString(),
        }))

        // Add to existing notifications
        if (jobNotifications.length > 0) {
          const existingNotifications = localStorage.getItem("job_shield_notifications")
            ? JSON.parse(localStorage.getItem("job_shield_notifications") || "[]")
            : []

          localStorage.setItem(
            "job_shield_notifications",
            JSON.stringify([...existingNotifications, ...jobNotifications]),
          )

          // Reload notifications
          loadNotifications()
        }
      }
    }

    // Set up interval to check for new notifications
    const interval = setInterval(loadNotifications, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }))

    setNotifications(updatedNotifications)
    setUnreadCount(0)

    // Update in localStorage
    const allNotifications = localStorage.getItem("job_shield_notifications")
      ? JSON.parse(localStorage.getItem("job_shield_notifications") || "[]")
      : []

    const updatedAllNotifications = allNotifications.map((notification: Notification) => {
      if (notification.userId === user?.id) {
        return {
          ...notification,
          read: true,
        }
      }
      return notification
    })

    localStorage.setItem("job_shield_notifications", JSON.stringify(updatedAllNotifications))
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    const updatedNotifications = notifications.map((n) => {
      if (n.id === notification.id) {
        return { ...n, read: true }
      }
      return n
    })

    setNotifications(updatedNotifications)
    setUnreadCount(updatedNotifications.filter((n) => !n.read).length)

    // Update in localStorage
    const allNotifications = localStorage.getItem("job_shield_notifications")
      ? JSON.parse(localStorage.getItem("job_shield_notifications") || "[]")
      : []

    const updatedAllNotifications = allNotifications.map((n: Notification) => {
      if (n.id === notification.id) {
        return { ...n, read: true }
      }
      return n
    })

    localStorage.setItem("job_shield_notifications", JSON.stringify(updatedAllNotifications))

    // Navigate based on notification type
    if (notification.type === "application" && notification.jobId) {
      router.push(`/jobs/${notification.jobId}`)
    } else if (notification.type === "new_job" && notification.jobId) {
      router.push(`/jobs/${notification.jobId}`)
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "JS"

    if (user.name) {
      const nameParts = user.name.split(" ")
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      }
      return user.name.substring(0, 2).toUpperCase()
    }

    return user.email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Job Shield</span>
          </Link>

          <nav className="hidden md:flex md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {unreadCount}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`${notification.read ? "opacity-70" : ""} cursor-pointer`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(notification.date).toLocaleString()}</p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.name || user.email}
                  <div className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                    {user.userType === "recruiter" ? (
                      <>
                        Recruiter
                        {user.isVerified && (
                          <Badge
                            variant="outline"
                            className="ml-1 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" /> Verified
                          </Badge>
                        )}
                      </>
                    ) : (
                      "Job Seeker"
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                {user.userType === "recruiter" && !user.isVerified && (
                  <DropdownMenuItem onClick={() => router.push("/verification")}>Get Verified</DropdownMenuItem>
                )}
                {user.userType === "admin" && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>Admin Panel</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex md:gap-2">
              <Button asChild variant="outline">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 py-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">Job Shield</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>

                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === link.href ? "text-primary" : "text-muted-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name || user.email}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {user.userType === "recruiter" ? (
                            <>
                              Recruiter
                              {user.isVerified && (
                                <Badge
                                  variant="outline"
                                  className="ml-1 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100"
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" /> Verified
                                </Badge>
                              )}
                            </>
                          ) : (
                            "Job Seeker"
                          )}
                        </div>
                      </div>
                    </div>
                    <Button asChild variant="outline" onClick={() => setIsOpen(false)}>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    {user.userType === "recruiter" && !user.isVerified && (
                      <Button asChild variant="outline" onClick={() => setIsOpen(false)}>
                        <Link href="/verification">Get Verified</Link>
                      </Button>
                    )}
                    <Button onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" onClick={() => setIsOpen(false)}>
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild onClick={() => setIsOpen(false)}>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm">Switch Theme</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setTheme("light")}>
                      <Sun className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setTheme("dark")}>
                      <Moon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
