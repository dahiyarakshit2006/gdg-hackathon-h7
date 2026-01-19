"use client"

import React from "react"

import {
  Trophy,
  Flame,
  Medal,
  Star,
  Target,
  Zap,
  Crown,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface LeaderboardEntry {
  rank: number
  user: {
    name: string
    initials: string
    college: string
    avatar?: string
  }
  points: number
  eventsAttended: number
}

interface GamificationProps {
  currentStreak: number
  longestStreak: number
  totalPoints: number
  level: number
  nextLevelPoints: number
  badges: any[]
  leaderboard: LeaderboardEntry[]
  userRank: number
}

const badgeIcons: Record<string, React.ReactNode> = {
  first_event: <Star className="h-5 w-5" />,
  streak_7: <Flame className="h-5 w-5" />,
  organizer: <Crown className="h-5 w-5" />,
  social: <Users className="h-5 w-5" />,
  early_bird: <Zap className="h-5 w-5" />,
  champion: <Trophy className="h-5 w-5" />,
}

export function Gamification({
  currentStreak,
  longestStreak,
  totalPoints,
  level,
  nextLevelPoints,
  badges,
  leaderboard,
  userRank,
}: GamificationProps) {
  const levelProgress = (totalPoints / nextLevelPoints) * 100

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-chart-3/20 to-transparent border-chart-3/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Current Streak</p>
                <p className="text-2xl font-bold text-chart-3">{currentStreak} days</p>
              </div>
              <Flame className="h-8 w-8 text-chart-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Points</p>
                <p className="text-2xl font-bold text-primary">{totalPoints.toLocaleString()}</p>
              </div>
              <Star className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/20 to-transparent border-accent/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Level</p>
                <p className="text-2xl font-bold text-accent">{level}</p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-5/20 to-transparent border-chart-5/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Your Rank</p>
                <p className="text-2xl font-bold text-chart-5">#{userRank}</p>
              </div>
              <Trophy className="h-8 w-8 text-chart-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Level {level}</span>
            <span className="text-sm text-muted-foreground">
              {totalPoints} / {nextLevelPoints} XP
            </span>
          </div>
          <Progress value={levelProgress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {nextLevelPoints - totalPoints} XP to Level {level + 1}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Medal className="h-5 w-5 text-chart-3" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-lg text-center transition-all ${
                    badge.earned
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-muted/30 opacity-50 grayscale"
                  }`}
                >
                  <div
                    className={`mx-auto h-10 w-10 rounded-full flex items-center justify-center ${
                      badge.earned ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {badgeIcons[badge.id] || <Star className="h-5 w-5" />}
                  </div>
                  <p className="text-xs font-medium mt-2">{badge.name}</p>
                  {badge.earned && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-success">
                      <span className="sr-only">Earned</span>
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-chart-3" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    entry.rank === userRank
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      entry.rank === 1
                        ? "bg-chart-3 text-background"
                        : entry.rank === 2
                        ? "bg-muted-foreground text-background"
                        : entry.rank === 3
                        ? "bg-chart-4 text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      style={{
                        backgroundColor: `hsl(${index * 50}, 70%, 50%)`,
                      }}
                    >
                      {entry.user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.user.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.user.college}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {entry.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.eventsAttended} events
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
