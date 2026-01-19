"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Registration {
  id: string;
  status: string;
  qr_code: string;
  checked_in_at: string | null;
  created_at: string;
  events: {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    category: string;
    image_url: string;
  };
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(
    null
  );
  const supabase = createClient();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("registrations")
      .select("*, events(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setRegistrations(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateQRUrl = (qrCode: string, registration: Registration) => {
    const data = encodeURIComponent(
      JSON.stringify({
        type: "event_ticket",
        qr_code: qrCode,
        registration_id: registration.id,
        event_id: registration.events.id,
        event_title: registration.events.title,
      })
    );
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registered":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Ticket className="w-3 h-3 mr-1" />
            Registered
          </Badge>
        );
      case "attended":
        return (
          <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Attended
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const upcomingRegistrations = registrations.filter((r) => {
    const eventDate = new Date(r.events.event_date);
    return eventDate > new Date() && r.status !== "cancelled";
  });

  const pastRegistrations = registrations.filter((r) => {
    const eventDate = new Date(r.events.event_date);
    return eventDate <= new Date() || r.status === "attended";
  });

  const cancelledRegistrations = registrations.filter(
    (r) => r.status === "cancelled"
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="h-10 bg-muted rounded w-full animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const RegistrationCard = ({ registration }: { registration: Registration }) => {
    const isUpcoming = new Date(registration.events.event_date) > new Date();
    const canShowQR =
      registration.status === "registered" ||
      registration.status === "attended";

    return (
      <Card className="border-border hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-20 h-20 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              {registration.events.image_url ? (
                <img
                  src={registration.events.image_url || "/placeholder.svg"}
                  alt={registration.events.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Calendar className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold line-clamp-1">
                  {registration.events.title}
                </h3>
                {getStatusBadge(registration.status)}
              </div>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(registration.events.event_date)} at{" "}
                  {formatTime(registration.events.event_date)}
                </p>
                {registration.events.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {registration.events.location}
                  </p>
                )}
              </div>
              {registration.checked_in_at && (
                <p className="text-xs text-chart-3 mt-2">
                  Checked in at {formatTime(registration.checked_in_at)}
                </p>
              )}
            </div>
            {canShowQR && isUpcoming && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTicket(registration)}
                className="sm:self-center"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Show QR
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <p className="text-muted-foreground">
          View your event registrations and tickets
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Upcoming ({upcomingRegistrations.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Past ({pastRegistrations.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Cancelled ({cancelledRegistrations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingRegistrations.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't registered for any upcoming events yet
                </p>
                <Button asChild>
                  <a href="/participant/events">Browse Events</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingRegistrations.map((reg) => (
                <RegistrationCard key={reg.id} registration={reg} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastRegistrations.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No past events</h3>
                <p className="text-muted-foreground">
                  Your attended events will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastRegistrations.map((reg) => (
                <RegistrationCard key={reg.id} registration={reg} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {cancelledRegistrations.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No cancelled registrations
                </h3>
                <p className="text-muted-foreground">
                  Cancelled registrations will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cancelledRegistrations.map((reg) => (
                <RegistrationCard key={reg.id} registration={reg} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Event Ticket</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {selectedTicket.events.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDate(selectedTicket.events.event_date)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatTime(selectedTicket.events.event_date)}
                    </p>
                    {selectedTicket.events.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedTicket.events.location}
                      </p>
                    )}
                  </div>

                  <div className="text-center py-4">
                    <div className="inline-block p-4 bg-background rounded-xl border border-border">
                      <img
                        src={generateQRUrl(
                          selectedTicket.qr_code,
                          selectedTicket
                        ) || "/placeholder.svg"}
                        alt="Event QR Code"
                        className="w-48 h-48"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Show this QR code at check-in
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      {selectedTicket.qr_code}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
