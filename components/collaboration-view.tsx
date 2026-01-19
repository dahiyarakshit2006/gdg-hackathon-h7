"use client"

import { useState } from "react"
import {
  Building2,
  Calendar,
  Users,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface College {
  id: string
  name: string
  shortName: string
  color: string
  eventsHosted: number
  totalParticipants: number
}

interface SharedEvent {
  id: string
  title: string
  date: Date
  hostCollege: College
  participatingColleges: College[]
  status: "upcoming" | "ongoing" | "completed"
}

interface CollaborationViewProps {
  colleges: College[]
  sharedEvents: SharedEvent[]
  sharedCalendar: { date: Date; events: string[] }[]
}

export function CollaborationView({
  colleges,
  sharedEvents,
  sharedCalendar,
}: CollaborationViewProps) {
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null)

  const currentMonth = new Date()
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const getEventsForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const calendarEntry = sharedCalendar.find(
      (c) => c.date.toDateString() === date.toDateString()
    )
    return calendarEntry?.events || []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Cross-College Collaboration</h2>
          <p className="text-sm text-muted-foreground">
            Shared events and calendars across partner institutions
          </p>
        </div>
      </div>

      <Tabs defaultValue="colleges" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="colleges">Colleges</TabsTrigger>
          <TabsTrigger value="events">Shared Events</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="colleges" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleges.map((college) => (
              <Card
                key={college.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedCollege(college)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center text-lg font-bold"
                      style={{
                        backgroundColor: college.color,
                        color: "white",
                      }}
                    >
                      {college.shortName}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{college.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {college.eventsHosted} events
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {college.totalParticipants.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="space-y-4">
            {sharedEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div
                      className="w-2"
                      style={{ backgroundColor: event.hostCollege.color }}
                    />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={
                                event.status === "upcoming"
                                  ? "bg-primary/20 text-primary"
                                  : event.status === "ongoing"
                                  ? "bg-success/20 text-success"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {event.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Hosted by {event.hostCollege.name}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.date.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-sm text-muted-foreground">
                          Participating:
                        </span>
                        <div className="flex -space-x-2">
                          {event.participatingColleges.map((college) => (
                            <Avatar
                              key={college.id}
                              className="h-6 w-6 border-2 border-background"
                            >
                              <AvatarFallback
                                className="text-xs"
                                style={{ backgroundColor: college.color }}
                              >
                                {college.shortName}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          +{event.participatingColleges.length} colleges
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-xs font-medium text-muted-foreground p-2"
                  >
                    {day}
                  </div>
                ))}
                {paddingDays.map((_, index) => (
                  <div key={`padding-${index}`} className="p-2" />
                ))}
                {calendarDays.map((day) => {
                  const events = getEventsForDay(day)
                  const isToday = day === new Date().getDate()

                  return (
                    <div
                      key={day}
                      className={`p-2 rounded-lg min-h-[60px] text-sm ${
                        isToday
                          ? "bg-primary/20 border border-primary"
                          : events.length > 0
                          ? "bg-muted/50 hover:bg-muted"
                          : "hover:bg-muted/30"
                      } transition-colors cursor-pointer`}
                    >
                      <span
                        className={isToday ? "font-semibold text-primary" : ""}
                      >
                        {day}
                      </span>
                      {events.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {events.slice(0, 2).map((event, i) => (
                            <div
                              key={i}
                              className="text-xs truncate bg-accent/20 text-accent px-1 rounded"
                            >
                              {event}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{events.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
