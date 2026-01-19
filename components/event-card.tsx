"use client"

import { Calendar, MapPin, Users, Clock, QrCode, Check } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface EventCardProps {
  id: string
  title: string
  description: string
  date: Date
  location: string
  category: string
  attendees: number
  maxAttendees: number
  isRegistered?: boolean
  hasQrCode?: boolean
  imageUrl?: string
  onRegister?: (id: string) => void
  onViewQr?: (id: string) => void
}

export function EventCard({
  id,
  title,
  description,
  date,
  location,
  category,
  attendees,
  maxAttendees,
  isRegistered = false,
  hasQrCode = false,
  imageUrl,
  onRegister,
  onViewQr,
}: EventCardProps) {
  const isUpcoming = date > new Date()
  const isAlmostFull = attendees / maxAttendees > 0.8
  const hoursUntil = Math.floor((date.getTime() - Date.now()) / 1000 / 60 / 60)
  const showQrButton = isRegistered && hasQrCode && hoursUntil <= 24 && hoursUntil > 0

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      "Tech": "bg-primary/20 text-primary",
      "Cultural": "bg-accent/20 text-accent",
      "Sports": "bg-chart-3/20 text-chart-3",
      "Academic": "bg-chart-5/20 text-chart-5",
      "Workshop": "bg-chart-2/20 text-chart-2",
    }
    return colors[cat] || "bg-muted text-muted-foreground"
  }

  return (
    <Card className="group overflow-hidden hover:border-primary/50 transition-all duration-300">
      {imageUrl && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <Badge
            className={`absolute top-3 left-3 ${getCategoryColor(category)}`}
          >
            {category}
          </Badge>
        </div>
      )}

      <CardHeader className={imageUrl ? "pt-3" : ""}>
        {!imageUrl && (
          <Badge className={`w-fit ${getCategoryColor(category)}`}>
            {category}
          </Badge>
        )}
        <h3 className="font-semibold text-lg leading-tight line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 text-primary" />
          <span>
            {date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
          <Clock className="h-4 w-4 ml-2 text-primary" />
          <span>
            {date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="truncate">{location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span
              className={isAlmostFull ? "text-warning font-medium" : "text-muted-foreground"}
            >
              {attendees}/{maxAttendees}
            </span>
          </div>
          {isAlmostFull && !isRegistered && (
            <Badge variant="outline" className="text-warning border-warning/50 text-xs">
              Almost Full
            </Badge>
          )}
          {isRegistered && (
            <Badge className="bg-success/20 text-success border-0 text-xs">
              <Check className="h-3 w-3 mr-1" />
              Registered
            </Badge>
          )}
        </div>

        {/* Progress bar for capacity */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isAlmostFull ? "bg-warning" : "bg-primary"
            }`}
            style={{ width: `${(attendees / maxAttendees) * 100}%` }}
          />
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        {showQrButton ? (
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => onViewQr?.(id)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            View QR Code
          </Button>
        ) : isRegistered ? (
          <Button variant="outline" className="flex-1 bg-transparent" disabled>
            <Check className="h-4 w-4 mr-2" />
            Registered
          </Button>
        ) : (
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => onRegister?.(id)}
            disabled={attendees >= maxAttendees}
          >
            {attendees >= maxAttendees ? "Event Full" : "Register Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
