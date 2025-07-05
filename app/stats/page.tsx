"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { getStats, formatTime, type StudyStats } from "@/lib/storage"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Target, Coffee, TrendingUp, Calendar } from "lucide-react"

export default function StatsPage() {
  const [stats, setStats] = useState<StudyStats | null>(null)

  useEffect(() => {
    setStats(getStats())
  }, [])

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading stats...</div>
        </div>
      </div>
    )
  }

  // Prepare daily data for the last 7 days
  const dailyData = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    const dayEnd = dayStart + 24 * 60 * 60 * 1000

    const dayFocusTime = stats.sessionsThisWeek
      .filter((s) => s.type === "focus" && s.timestamp >= dayStart && s.timestamp < dayEnd)
      .reduce((sum, s) => sum + s.duration, 0)

    dailyData.push({
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      focusTime: Math.round(dayFocusTime / 60), // Convert to minutes
      date: date.toLocaleDateString(),
    })
  }

  // Prepare pie chart data
  const pieData = [
    {
      name: "Focus Time",
      value: stats.totalFocusTime,
      color: "#3b82f6",
    },
    {
      name: "Break Time",
      value: stats.totalBreakTime,
      color: "#10b981",
    },
  ]

  const todayFocusTime = stats.sessionsToday.filter((s) => s.type === "focus").reduce((sum, s) => sum + s.duration, 0)

  const todayBreakTime = stats.sessionsToday.filter((s) => s.type === "break").reduce((sum, s) => sum + s.duration, 0)

  const focusSessions = stats.sessionsToday.filter((s) => s.type === "focus").length
  const avgSessionLength = focusSessions > 0 ? todayFocusTime / focusSessions : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Productivity Analytics
            </h1>
            <p className="text-muted-foreground text-lg">Track your progress and identify patterns</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatTime(todayFocusTime)}</div>
                <p className="text-xs text-muted-foreground">{focusSessions} sessions completed</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Break Time</CardTitle>
                <Coffee className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatTime(todayBreakTime)}</div>
                <p className="text-xs text-muted-foreground">Well-deserved rest</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatTime(stats.totalFocusTime)}</div>
                <p className="text-xs text-muted-foreground">This week's focus time</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatTime(avgSessionLength)}</div>
                <p className="text-xs text-muted-foreground">Average focus length</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Focus Time Chart */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Daily Focus Time</CardTitle>
                <CardDescription>Your focus time over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [`${value} min`, "Focus Time"]}
                        labelFormatter={(label) => `Day: ${label}`}
                      />
                      <Bar dataKey="focusTime" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Focus vs Break Time Pie Chart */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Focus vs Break Time</CardTitle>
                <CardDescription>Distribution of your time this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatTime(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session History */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Your latest study sessions from today</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.sessionsToday.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No sessions recorded today. Start your first session!
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.sessionsToday
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((session, index) => (
                      <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-lg ${
                              session.type === "focus"
                                ? "bg-blue-100 dark:bg-blue-900/20"
                                : "bg-green-100 dark:bg-green-900/20"
                            }`}
                          >
                            {session.type === "focus" ? (
                              <Target className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Coffee className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{session.type === "focus" ? "Focus Session" : "Break Time"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={session.mode === "pomodoro" ? "default" : "secondary"}>{session.mode}</Badge>
                          <span className="font-medium">{formatTime(session.duration)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
