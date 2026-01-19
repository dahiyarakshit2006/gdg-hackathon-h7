"use client"

import { QrCode, Download, Share2, Clock, MapPin, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    title: string
    date: Date
    location: string
    confirmationCode: string
  }
}

export function QRCodeModal({ isOpen, onClose, event }: QRCodeModalProps) {
  // Generate a simple QR code pattern using SVG
  const generateQRPattern = () => {
    // This creates a deterministic pattern based on the confirmation code
    const seed = event.confirmationCode.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
    const size = 21
    const cells: boolean[][] = []
    
    for (let i = 0; i < size; i++) {
      cells[i] = []
      for (let j = 0; j < size; j++) {
        // Create a pseudo-random pattern
        cells[i][j] = ((seed * (i + 1) * (j + 1)) % 7) < 3
      }
    }

    // Add finder patterns (the three corner squares)
    const addFinderPattern = (startX: number, startY: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (
            i === 0 || i === 6 || j === 0 || j === 6 ||
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)
          ) {
            cells[startY + i][startX + j] = true
          } else {
            cells[startY + i][startX + j] = false
          }
        }
      }
    }

    addFinderPattern(0, 0)
    addFinderPattern(size - 7, 0)
    addFinderPattern(0, size - 7)

    return cells
  }

  const qrCells = generateQRPattern()
  const cellSize = 8
  const qrSize = 21 * cellSize

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Event Check-in QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Info */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h3 className="font-semibold">{event.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {event.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {event.date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center p-6 bg-background rounded-lg border border-border">
            <svg
              width={qrSize + 32}
              height={qrSize + 32}
              viewBox={`0 0 ${qrSize + 32} ${qrSize + 32}`}
              className="rounded-lg"
            >
              <rect
                x="0"
                y="0"
                width={qrSize + 32}
                height={qrSize + 32}
                fill="white"
              />
              <g transform={`translate(16, 16)`}>
                {qrCells.map((row, i) =>
                  row.map((cell, j) =>
                    cell ? (
                      <rect
                        key={`${i}-${j}`}
                        x={j * cellSize}
                        y={i * cellSize}
                        width={cellSize}
                        height={cellSize}
                        fill="black"
                      />
                    ) : null
                  )
                )}
              </g>
            </svg>

            <Badge variant="outline" className="mt-4 font-mono text-lg">
              {event.confirmationCode}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Show this code at the venue for check-in
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Save QR
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            This QR code is valid for 24 hours before the event starts
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
