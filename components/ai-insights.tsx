"use client"

import { useState } from "react"
import {
  Brain,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Meh,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

interface TurnoutPrediction {
  event: string
  predicted: number
  actual?: number
  confidence: number
}

interface SentimentData {
  positive: number
  neutral: number
  negative: number
}

interface Recommendation {
  id: string
  event: string
  reason: string
  match: number
}

interface AIInsightsProps {
  turnoutData: TurnoutPrediction[]
  sentimentData: SentimentData
  recommendations: Recommendation[]
  historicalData: { date: string; attendance: number; predicted: number }[]
}

const SENTIMENT_COLORS = {
  positive: "oklch(0.65 0.2 145)",
  neutral: "oklch(0.7 0.18 50)",
  negative: "oklch(0.6 0.2 25)",
}

export function AIInsights({
  turnoutData,
  sentimentData,
  recommendations,
  historicalData,
}: AIInsightsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const sentimentPieData = [
    { name: "Positive", value: sentimentData.positive, color: SENTIMENT_COLORS.positive },
    { name: "Neutral", value: sentimentData.neutral, color: SENTIMENT_COLORS.neutral },
    { name: "Negative", value: sentimentData.negative, color: SENTIMENT_COLORS.negative },
  ]

  const totalSentiment = sentimentData.positive + sentimentData.neutral + sentimentData.negative
  const overallSentiment =
    sentimentData.positive > sentimentData.negative
      ? "Positive"
      : sentimentData.negative > sentimentData.positive
      ? "Negative"
      : "Neutral"

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
            <p className="text-sm text-muted-foreground">
              Predictions and analytics powered by Vertex AI
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnout Prediction Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Turnout Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.15 200)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.55 0.15 200)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                  <XAxis dataKey="date" stroke="oklch(0.65 0 0)" fontSize={12} />
                  <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0.01 260)",
                      border: "1px solid oklch(0.28 0.01 260)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="oklch(0.65 0.2 145)"
                    fillOpacity={1}
                    fill="url(#colorAttendance)"
                    name="Actual"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="oklch(0.55 0.15 200)"
                    fillOpacity={1}
                    fill="url(#colorPredicted)"
                    name="Predicted"
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Upcoming Event Predictions */}
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-medium">Upcoming Events</h4>
              {turnoutData.slice(0, 3).map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-sm truncate">{event.event}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {event.predicted} predicted
                    </Badge>
                    <span
                      className="text-xs text-muted-foreground"
                      title="Confidence level"
                    >
                      {event.confidence}% conf.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              Feedback Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-success" />
                  <span className="text-sm">Positive</span>
                  <Badge variant="outline" className="ml-auto font-mono">
                    {((sentimentData.positive / totalSentiment) * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Meh className="h-4 w-4 text-warning" />
                  <span className="text-sm">Neutral</span>
                  <Badge variant="outline" className="ml-auto font-mono">
                    {((sentimentData.neutral / totalSentiment) * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Negative</span>
                  <Badge variant="outline" className="ml-auto font-mono">
                    {((sentimentData.negative / totalSentiment) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">Overall Sentiment</p>
              <p
                className={`text-lg font-semibold ${
                  overallSentiment === "Positive"
                    ? "text-success"
                    : overallSentiment === "Negative"
                    ? "text-destructive"
                    : "text-warning"
                }`}
              >
                {overallSentiment}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations (Gemini Concierge) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-chart-3" />
            Personalized Recommendations
            <Badge variant="secondary" className="ml-2 text-xs">
              Powered by Gemini
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{rec.event}</h4>
                  <Badge className="bg-primary/20 text-primary">
                    {rec.match}% match
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.reason}</p>
                <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
