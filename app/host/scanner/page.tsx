

import React from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  User,
  Mail,
  School,
  Hash,
  Calendar,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Users } from "lucide-react"; // Import Users icon

interface Event {
  id: string;
  title: string;
}

interface ParticipantInfo {
  id: string;
  full_name: string;
  email: string;
  college: string;
  student_id: string;
  avatar_url: string;
  created_at: string;
}

interface RegistrationInfo {
  id: string;
  status: string;
  qr_code: string;
  checked_in_at: string | null;
  user_id: string;
  event_id: string;
}

interface CheckInResult {
  success: boolean;
  message: string;
  participant?: ParticipantInfo;
  registration?: RegistrationInfo;
}

const Loading = () => null;

export default function ScannerPage() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<
    Array<{
      participant: ParticipantInfo;
      time: string;
    }>
  >([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("events")
      .select("id, title")
      .eq("host_id", user.id)
      .in("status", ["upcoming", "ongoing"]);

    if (data) {
      setEvents(data);
      if (data.length > 0) {
        setSelectedEvent(data[0].id);
      }
    }
    setLoading(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (err) {
      console.log("[v0] Camera access error:", err);
      alert(
        "Unable to access camera. Please use manual code entry or check permissions."
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const processQRData = async (qrData: string) => {
    if (!selectedEvent) {
      setCheckInResult({
        success: false,
        message: "Please select an event first",
      });
      return;
    }

    setCheckInResult(null);

    try {
      let parsedData: { qr_code?: string; registration_id?: string; id?: string; type?: string };
      
      try {
        parsedData = JSON.parse(decodeURIComponent(qrData));
      } catch {
        // If not JSON, treat as raw QR code
        parsedData = { qr_code: qrData };
      }

      // Handle participant ID card scan
      if (parsedData.type === "participant_id" && parsedData.id) {
        // Find registration for this participant
        const { data: registration } = await supabase
          .from("registrations")
          .select("*, profiles(*)")
          .eq("event_id", selectedEvent)
          .eq("user_id", parsedData.id)
          .single();

        if (!registration) {
          setCheckInResult({
            success: false,
            message: "Participant is not registered for this event",
          });
          return;
        }

        await handleCheckIn(registration, registration.profiles);
        return;
      }

      // Handle event ticket scan
      const qrCode = parsedData.qr_code || qrData;

      const { data: registration } = await supabase
        .from("registrations")
        .select("*")
        .eq("qr_code", qrCode)
        .eq("event_id", selectedEvent)
        .single();

      if (!registration) {
        setCheckInResult({
          success: false,
          message: "Invalid QR code or ticket not found for this event",
        });
        return;
      }

      const { data: participant } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", registration.user_id)
        .single();

      await handleCheckIn(registration, participant);
    } catch (error) {
      console.log("[v0] QR processing error:", error);
      setCheckInResult({
        success: false,
        message: "Error processing QR code. Please try again.",
      });
    }
  };

  const handleCheckIn = async (
    registration: RegistrationInfo,
    participant: ParticipantInfo | null
  ) => {
    if (registration.status === "attended") {
      setCheckInResult({
        success: false,
        message: "Already checked in!",
        participant: participant || undefined,
        registration,
      });
      return;
    }

    if (registration.status === "cancelled") {
      setCheckInResult({
        success: false,
        message: "Registration was cancelled",
        participant: participant || undefined,
        registration,
      });
      return;
    }

    // Update registration status
    const { error } = await supabase
      .from("registrations")
      .update({
        status: "attended",
        checked_in_at: new Date().toISOString(),
      })
      .eq("id", registration.id);

    if (error) {
      setCheckInResult({
        success: false,
        message: "Failed to check in. Please try again.",
      });
      return;
    }

    setCheckInResult({
      success: true,
      message: "Successfully checked in!",
      participant: participant || undefined,
      registration: { ...registration, status: "attended" },
    });

    // Add to recent check-ins
    if (participant) {
      setRecentCheckIns([
        {
          participant,
          time: new Date().toLocaleTimeString(),
        },
        ...recentCheckIns.slice(0, 9),
      ]);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processQRData(manualCode.trim());
      setManualCode("");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">QR Scanner</h1>
          <p className="text-muted-foreground">
            Scan participant QR codes for check-in
          </p>
        </div>
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Select event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {events.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No active events</h3>
            <p className="text-muted-foreground">
              You need to have upcoming or ongoing events to use the scanner
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Camera Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-secondary rounded-lg overflow-hidden relative">
                  {scanning ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-primary rounded-lg animate-pulse" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <QrCode className="w-16 h-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        Click "Start Camera" to scan QR codes
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  {scanning ? (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={stopCamera}
                    >
                      Stop Camera
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={startCamera}>
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Manual Entry */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Manual Entry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <Input
                    placeholder="Enter QR code or registration ID..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {/* Check-in Result */}
            {checkInResult && (
              <Card
                className={`border-2 ${checkInResult.success ? "border-chart-3/50 bg-chart-3/5" : "border-destructive/50 bg-destructive/5"}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {checkInResult.success ? (
                      <div className="w-12 h-12 rounded-full bg-chart-3/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-chart-3" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-destructive" />
                      </div>
                    )}
                    <div>
                      <h3
                        className={`font-semibold ${checkInResult.success ? "text-chart-3" : "text-destructive"}`}
                      >
                        {checkInResult.success ? "Check-in Successful" : "Check-in Failed"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {checkInResult.message}
                      </p>
                    </div>
                  </div>

                  {/* Participant ID Card Display */}
                  {checkInResult.participant && (
                    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
                      <div className="bg-gradient-to-r from-primary to-accent p-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary-foreground" />
                          <span className="font-bold text-primary-foreground text-sm">
                            CampusHub ID Card
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage
                              src={checkInResult.participant.avatar_url || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xl bg-primary/10 text-primary">
                              {checkInResult.participant.full_name?.charAt(0) ||
                                "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold text-lg">
                              {checkInResult.participant.full_name}
                            </h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              Participant
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Hash className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Student ID:
                            </span>
                            <span className="font-medium">
                              {checkInResult.participant.student_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">
                              {checkInResult.participant.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <School className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              College:
                            </span>
                            <span className="font-medium">
                              {checkInResult.participant.college}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Member Since:
                            </span>
                            <span className="font-medium">
                              {formatDate(checkInResult.participant.created_at)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-transparent"
                    onClick={() => setCheckInResult(null)}
                  >
                    Scan Next
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Check-ins */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Recent Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentCheckIns.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No check-ins yet for this session
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCheckIns.map((checkIn, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={checkIn.participant.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {checkIn.participant.full_name?.charAt(0) || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {checkIn.participant.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {checkIn.participant.college}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs text-chart-3"
                        >
                          {checkIn.time}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export function generateStaticParams() {
  return [{ lang: "en" }];
}
