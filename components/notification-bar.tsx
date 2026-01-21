"use client"

import { useState, useEffect } from "react"
import { Bell, X, AlertCircle, CheckCircle, Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: string
  type: "alert" | "reminder" | "update" | "success"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Venue Change",
    message: "Tech Fest moved to Main Auditorium",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: "2",
    type: "reminder",
    title: "Event Starting Soon",
    message: "Hackathon begins in 2 hours",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "3",
    type: "success",
    title: "Registration Confirmed",
    message: "You're registered for Cultural Night",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
  },
  {
    id: "4",
    type: "update",
    title: "New Event Added",
    message: "AI Workshop added to your feed",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    read: true,
  },
]

export function NotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [currentAlert, setCurrentAlert] = useState<Notification | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  const unreadCount = notifications.filter((n) => !n.read).length
  const urgentNotification = notifications.find((n) => n.type === "alert" && !n.read)

  useEffect(() => {
    if (urgentNotification) {
      setCurrentAlert(urgentNotification)
    }
  }, [urgentNotification])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const dismissAlert = () => {
    if (currentAlert) {
      markAsRead(currentAlert.id)
      setCurrentAlert(null)
    }
    setIsVisible(false)
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "reminder":
        return <Clock className="h-4 w-4 text-warning" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />
      default:
        return <Bell className="h-4 w-4 text-accent" />
    }
  }

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 1000 / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <>
      {/* Urgent Alert Banner */}
      {currentAlert && isVisible && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-sm font-medium text-destructive">
                {currentAlert.title}:
              </span>
              <span className="text-sm text-foreground/80">{currentAlert.message}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={dismissAlert}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss alert</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CH</span>
            </div>
            <span className="font-semibold text-lg">Planora</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Events
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Assets
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Analytics
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 cursor-pointer ${
                        !notification.read ? "bg-muted/50" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="mt-0.5">{getIcon(notification.type)}</div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary">
                  View all notifications
                  <ChevronRight className="h-4 w-4 ml-1" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">JD</span>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
