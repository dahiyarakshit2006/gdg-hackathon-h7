"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Calendar,
  Search,
  Users,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  status: string;
  category: string;
  current_registrations: number;
  max_capacity: number;
  registration_fee: number;
  image_url: string;
  host_id: string;
  college_id?: string;
  profiles?: { full_name: string };
}

const Loading = () => null;

export default function ParticipantEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registering, setRegistering] = useState(false);

  const supabase = createClient();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = async () => {
  setLoading(true);

  // ✅ 1) Get logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("User Error:", userError);
    setLoading(false);
    return;
  }

  if (!user) {
    console.log("User not logged in");
    setEvents([]);
    setRegisteredEvents([]);
    setLoading(false);
    return;
  }

  // ✅ 2) Get user's profile (college_id)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.log("Profile Error:", profileError);
    setLoading(false);
    return;
  }

  if (!profile?.college_id) {
    console.log("college_id missing in profile");
    setEvents([]);
    setRegisteredEvents([]);
    setLoading(false);
    return;
  }

  // ✅ 3) Fetch upcoming events (same college only)
  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("*, profiles(full_name)")
    .eq("status", "upcoming")
    .eq("college_id", profile.college_id)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  if (eventsError) {
    console.log("Events Error:", eventsError);
    setLoading(false);
    return;
  }

  setEvents(eventsData || []);

  // ✅ 4) Fetch user's registrations
  const { data: regs, error: regsError } = await supabase
    .from("registrations")
    .select("event_id")
    .eq("user_id", user.id)
    .neq("status", "cancelled");

  if (regsError) {
    console.log("Registrations Error:", regsError);
    setRegisteredEvents([]);
  } else {
    setRegisteredEvents((regs || []).map((r: any) => r.event_id));
  }

  setLoading(false);
};


  const handleRegister = async (event: Event) => {
    setRegistering(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRegistering(false);
      return;
    }

    // ✅ Generate unique QR code
    const qrCode = `REG-${event.id.slice(0, 8)}-${user.id.slice(0, 8)}-${Date.now()}`;

    const { error } = await supabase.from("registrations").insert({
      event_id: event.id,
      user_id: user.id,
      status: "registered",
      qr_code: qrCode,
    });

    if (!error) {
      // ✅ Update event registration count
      await supabase
        .from("events")
        .update({
          current_registrations: (event.current_registrations || 0) + 1,
        })
        .eq("id", event.id);

      setRegisteredEvents([...registeredEvents, event.id]);
      setSelectedEvent(null);
      fetchEvents();
    }

    setRegistering(false);
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || e.category === category;
    return matchesSearch && matchesCategory;
  });

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

  const categories = [...new Set(events.map((e) => e.category).filter(Boolean))];

  return (
    <Suspense fallback={<Loading />}>
      {loading ? (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="h-10 bg-muted rounded flex-1 animate-pulse" />
            <div className="h-10 bg-muted rounded w-32 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-40 bg-muted rounded mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Browse Events</h1>
            <p className="text-muted-foreground">
              Discover and register for upcoming events
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  {search || category !== "all"
                    ? "Try adjusting your filters"
                    : "Check back later for new events"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => {
                const isRegistered = registeredEvents.includes(event.id);
                const isFull = event.current_registrations >= event.max_capacity;

                return (
                  <Card
                    key={event.id}
                    className="border-border overflow-hidden group hover:border-primary/50 transition-colors"
                  >
                    <div className="aspect-video bg-secondary relative">
                      {event.image_url ? (
                        <img
                          src={event.image_url || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      {event.category && (
                        <Badge className="absolute top-3 left-3 bg-background/80 text-foreground">
                          {event.category}
                        </Badge>
                      )}
                      {isRegistered && (
                        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Registered
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {event.description}
                      </p>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatDate(event.event_date)} at{" "}
                          {formatTime(event.event_date)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {event.current_registrations || 0}/{event.max_capacity}{" "}
                            spots
                          </div>
                          {event.registration_fee > 0 && (
                            <div className="flex items-center gap-1 text-chart-3">
                              <DollarSign className="w-4 h-4" />
                              {event.registration_fee}
                            </div>
                          )}
                        </div>
                      </div>

                      {isRegistered ? (
                        <Button variant="outline" className="w-full bg-transparent" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Already Registered
                        </Button>
                      ) : isFull ? (
                        <Button variant="outline" className="w-full bg-transparent" disabled>
                          Event Full
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => setSelectedEvent(event)}
                        >
                          Register Now
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Registration Dialog */}
          <Dialog
            open={!!selectedEvent}
            onOpenChange={() => setSelectedEvent(null)}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Registration</DialogTitle>
              </DialogHeader>
              {selectedEvent && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <h3 className="font-semibold">{selectedEvent.title}</h3>
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatDate(selectedEvent.event_date)} at{" "}
                        {formatTime(selectedEvent.event_date)}
                      </p>
                      {selectedEvent.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {selectedEvent.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedEvent.registration_fee > 0 && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-chart-3/10">
                      <span className="text-sm">Registration Fee</span>
                      <span className="font-bold text-chart-3">
                        ${selectedEvent.registration_fee}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setSelectedEvent(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleRegister(selectedEvent)}
                      disabled={registering}
                    >
                      {registering ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Confirm Registration"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Suspense>
  );
}
