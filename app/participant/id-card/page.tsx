"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Share2,
  QrCode,
  School,
  User,
  Mail,
  Hash,
  Calendar,
  Shield,
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  college: string;
  student_id: string;
  avatar_url: string;
  created_at: string;
}

export default function IDCardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  // Generate QR code data URL
  const generateQRCode = (data: string) => {
    // Using a simple QR code pattern for display
    // In production, you'd use a proper QR code library
    const qrData = encodeURIComponent(
      JSON.stringify({
        type: "participant_id",
        id: profile?.id,
        name: profile?.full_name,
        email: profile?.email,
        college: profile?.college,
        student_id: profile?.student_id,
        timestamp: Date.now(),
      })
    );
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto">
        <div className="h-[500px] bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Digital ID Card</h1>
        <p className="text-muted-foreground">
          Show this QR code for event check-in
        </p>
      </div>

      {/* ID Card */}
      <div ref={cardRef}>
        <Card className="border-2 border-primary/20 overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-primary-foreground">
                    Planora
                  </h2>
                  <p className="text-xs text-primary-foreground/80">
                    Event Pass
                  </p>
                </div>
              </div>
              <Badge className="bg-background/20 text-primary-foreground border-0">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Profile Section */}
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.full_name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{profile.full_name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Participant
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <School className="w-3 h-3 mr-1" />
                    {profile.college}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Hash className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Student ID</p>
                  <p className="font-medium">{profile.student_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-chart-3" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-medium">{formatDate(profile.created_at)}</p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <div className="inline-block p-4 bg-background rounded-2xl border border-border">
                <img
                  src={generateQRCode(profile.id) || "/placeholder.svg"}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                  crossOrigin="anonymous"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Scan for verification
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                ID: {profile.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </CardContent>

          {/* Footer */}
          <div className="border-t border-border px-6 py-3 bg-secondary/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                Valid for all registered events
              </span>
              <span>Planora 2024</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 bg-transparent">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Info */}
      <Card className="border-border">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">How to use your ID Card</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              Show this QR code to the event host during check-in
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              The host will scan your QR code to verify your identity
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              Your attendance will be automatically recorded
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
