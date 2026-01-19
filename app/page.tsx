"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Users,
  QrCode,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check user role and redirect
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "host") {
          router.push("/host/dashboard");
        } else {
          router.push("/participant/dashboard");
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const features = [
    {
      icon: Calendar,
      title: "Event Management",
      description:
        "Create, manage, and track events with ease. Set capacities, fees, and track registrations in real-time.",
    },
    {
      icon: QrCode,
      title: "QR Code Check-in",
      description:
        "Generate unique QR codes for participants. Scan for instant check-in and identity verification.",
    },
    {
      icon: BarChart3,
      title: "Budget Tracking",
      description:
        "Keep track of event finances with detailed budget categories, expense tracking, and sponsorship management.",
    },
    {
      icon: Users,
      title: "Attendee Management",
      description:
        "View, search, and manage all event registrations. Export attendee lists and track attendance.",
    },
    {
      icon: Shield,
      title: "Digital ID Cards",
      description:
        "Each participant gets a unique digital ID card with QR code for seamless event check-ins.",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description:
        "Get instant notifications for registrations, check-ins, and important event updates.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold">CampusHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              College Event Management
              <span className="text-primary"> Made Simple</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              The all-in-one platform for organizing, managing, and tracking
              college events. From registration to check-in, we have got you
              covered.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Start for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-card/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">
                Everything You Need to Run Events
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed specifically for college event
                organizers and participants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-border hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Role Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Choose Your Role</h2>
              <p className="mt-4 text-muted-foreground">
                Whether you are organizing events or attending them, we have got
                the tools for you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Host Card */}
              <Card className="border-2 border-accent/50 bg-gradient-to-br from-card to-accent/5">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                    <Shield className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Event Host</h3>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Create and manage events",
                      "Track registrations",
                      "QR code scanner for check-ins",
                      "Budget and expense tracking",
                      "View attendee details",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full bg-transparent" variant="outline">
                      Register as Host
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Participant Card */}
              <Card className="border-2 border-primary/50 bg-gradient-to-br from-card to-primary/5">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Participant</h3>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Browse and discover events",
                      "One-click registration",
                      "Digital ID card with QR code",
                      "Track your registrations",
                      "Quick event check-in",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full">Register as Participant</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Transform Your Campus Events?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of students and organizers already using CampusHub
              to create amazing event experiences.
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-10">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-semibold">CampusHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            2024 CampusHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
