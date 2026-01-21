"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Ticket,
  Clock,
  MapPin,
  ArrowRight,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  college: string;
  student_id: string;
  avatar_url: string;
}

interface Registration {
  id: string;
  status: string;
  qr_code: string;
  events: {
    id: string;
    title: string;
    event_date: string;
    location: string;
    category: string;
    image_url: string;
  };
}



export default function ParticipantDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const handleRegister = async (eventId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Please login first");

  const { error } = await supabase
    .from('registrations')
    .insert([{ 
  event_id: eventId, 
  user_id: user.id, 
  qr_code: `QR-${eventId}-${user.id.slice(0,5)}` // Dummy QR code string
}]);

  if (error) alert("Registration failed: " + error.message);
  else alert("Successfully registered!");
};

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch registrations with events
    const { data: eventsData } = await supabase.from("events").select("*");
if (eventsData) setAvailableEvents(eventsData);
    const { data: regs } = await supabase
      .from("registrations")
      .select("*, events(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (regs) {
      setRegistrations(regs);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const upcomingRegistrations = registrations.filter((r) => {
    const eventDate = new Date(r.events.event_date);
    return eventDate > new Date() && r.status !== "cancelled";
  });

  const pastRegistrations = registrations.filter((r) => {
    const eventDate = new Date(r.events.event_date);
    return eventDate <= new Date() || r.status === "attended";
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-xl">
                {profile?.full_name?.charAt(0) || "P"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                Welcome back, {profile?.full_name?.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground">
                {profile?.college} - {profile?.student_id}
              </p>
            </div>
            <Link href="/participant/id-card" className="hidden sm:block">
              <Button variant="outline" className="gap-2 bg-transparent">
                <CreditCard className="w-4 h-4" />
                View ID Card
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Upcoming Events
                </p>
                <p className="text-3xl font-bold mt-1">
                  {upcomingRegistrations.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attended</p>
                <p className="text-3xl font-bold mt-1">
                  {pastRegistrations.filter((r) => r.status === "attended").length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tickets</p>
                <p className="text-3xl font-bold mt-1">
                  {registrations.filter((r) => r.status === "registered").length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
          <Link href="/participant/registrations">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingRegistrations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No upcoming events</p>
              <Link href="#all-events">
                <Button className="mt-4 bg-transparent" variant="outline">
                  Browse Events
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingRegistrations.slice(0, 5).map((reg) => (
                <Link
                  key={reg.id}
                  href={`/participant/registrations/${reg.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{reg.events.title}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(reg.events.event_date)} at{" "}
                          {formatTime(reg.events.event_date)}
                        </span>
                        {reg.events.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {reg.events.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Ticket className="w-3 h-3 mr-1" />
                    Registered
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/participant/events">
          <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Browse Events</p>
                <p className="text-sm text-muted-foreground">
                  Find and register for upcoming events
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/participant/id-card">
          <Card className="border-border hover:border-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-medium">My ID Card</p>
                <p className="text-sm text-muted-foreground">
                  View your digital ID with QR code
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Live Events Section */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
  <h2 id="all-events" className="text-2xl font-bold mt-12 mb-6">Explore New Events</h2>
  {availableEvents.map((event) => (
    <div key={event.id} className="p-4 border rounded-xl bg-card shadow-sm hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-primary">{event.title}</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">New</span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {event.description}
      </p>
      <button onClick={()=> handleRegister(event.id)} className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all">
        Register for Event
      </button>
    </div>
  ))}
</div>
    </div>
  );
}



