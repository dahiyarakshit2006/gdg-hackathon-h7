"use client";

import { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  School,
  Hash,
  Calendar,
  Download,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Loading from "./loading";

interface Event {
  id: string;
  title: string;
}

interface Attendee {
  id: string;
  status: string;
  qr_code: string;
  checked_in_at: string | null;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    college: string;
    student_id: string;
    avatar_url: string;
    created_at: string;
  };
}

export default function AttendeesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(
    null
  );
  const supabase = createClient();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      fetchAttendees();
    }
  }, [selectedEvent, events]);

  const fetchEvents = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("events")
      .select("id, title")
      .eq("host_id", user.id);

    if (data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const fetchAttendees = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("registrations")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false });

    if (selectedEvent !== "all") {
      query = query.eq("event_id", selectedEvent);
    } else {
      const eventIds = events.map((e) => e.id);
      if (eventIds.length > 0) {
        query = query.in("event_id", eventIds);
      }
    }

    const { data } = await query;
    if (data) {
      setAttendees(data);
    }
  };

  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch =
      a.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.profiles?.student_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registered":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Clock className="w-3 h-3 mr-1" />
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
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = {
    total: attendees.length,
    registered: attendees.filter((a) => a.status === "registered").length,
    attended: attendees.filter((a) => a.status === "attended").length,
    cancelled: attendees.filter((a) => a.status === "cancelled").length,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Attendees</h1>
          <p className="text-muted-foreground">
            Manage event registrations and attendance
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registered</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.registered}
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attended</p>
                <p className="text-2xl font-bold text-chart-3">
                  {stats.attended}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-chart-3" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-destructive">
                  {stats.cancelled}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
            <SelectItem value="attended">Attended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attendees Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          {filteredAttendees.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No attendees found</h3>
              <p className="text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No one has registered for your events yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Checked In</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendees.map((attendee) => (
                  <TableRow
                    key={attendee.id}
                    className="cursor-pointer hover:bg-secondary/50"
                    onClick={() => setSelectedAttendee(attendee)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={attendee.profiles?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {attendee.profiles?.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {attendee.profiles?.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {attendee.profiles?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {attendee.profiles?.student_id}
                    </TableCell>
                    <TableCell>{attendee.profiles?.college}</TableCell>
                    <TableCell>{getStatusBadge(attendee.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(attendee.created_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {attendee.checked_in_at
                        ? formatTime(attendee.checked_in_at)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Attendee Detail Dialog */}
      <Dialog
        open={!!selectedAttendee}
        onOpenChange={() => setSelectedAttendee(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Attendee Details</DialogTitle>
          </DialogHeader>
          {selectedAttendee && (
            <div className="space-y-4">
              {/* ID Card Style Display */}
              <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
                <div className="bg-gradient-to-r from-primary to-accent p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary-foreground" />
                      <span className="font-bold text-primary-foreground text-sm">
                        Planora ID
                      </span>
                    </div>
                    {getStatusBadge(selectedAttendee.status)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage
                        src={selectedAttendee.profiles?.avatar_url || "/placeholder.svg"}
                      />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {selectedAttendee.profiles?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-lg">
                        {selectedAttendee.profiles?.full_name}
                      </h4>
                      <Badge variant="outline" className="text-xs mt-1">
                        Participant
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Student ID
                        </p>
                        <p className="font-medium">
                          {selectedAttendee.profiles?.student_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium text-sm">
                          {selectedAttendee.profiles?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                      <School className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">College</p>
                        <p className="font-medium">
                          {selectedAttendee.profiles?.college}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Registered on
                      </span>
                      <span>{formatDate(selectedAttendee.created_at)}</span>
                    </div>
                    {selectedAttendee.checked_in_at && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">
                          Checked in at
                        </span>
                        <span className="text-chart-3">
                          {formatTime(selectedAttendee.checked_in_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-xs text-muted-foreground">
                QR Code: {selectedAttendee.qr_code}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
