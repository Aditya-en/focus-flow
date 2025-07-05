"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { getStats, formatTime, type StudyStats } from "@/lib/storage"
import { Timer, Brain, BarChart3, Clock, Target, Zap } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState<StudyStats | null>(null)

  useEffect(() => {
    setStats(getStats())
  }, [])

  const todayFocusTime =
    stats?.sessionsToday.filter((s) => s.type === "focus").reduce((sum, s) => sum + s.duration, 0) || 0

  const todayBreakTime =
    stats?.sessionsToday.filter((s) => s.type === "break").reduce((sum, s) => sum + s.duration, 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to FocusFlow
            </h1>
            <p className="text-muted-foreground text-lg">Master your productivity with focused study sessions</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatTime(todayFocusTime)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.sessionsToday.filter((s) => s.type === "focus").length || 0} sessions
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Zap className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatTime(stats?.totalFocusTime || 0)}</div>
                <p className="text-xs text-muted-foreground">Total focus time</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Break Time</CardTitle>
                <Clock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatTime(todayBreakTime)}</div>
                <p className="text-xs text-muted-foreground">Today's breaks</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 hover:shadow-lg transition-all hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <Timer className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle>Pomodoro Technique</CardTitle>
                    <CardDescription>25 min focus + 5 min break</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Perfect for tasks requiring intense concentration. Short bursts of focused work with regular breaks.
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">25:00</Badge>
                  <Badge variant="outline">5:00</Badge>
                </div>
                <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                  <Link href="/timer?mode=pomodoro">Start Pomodoro</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Deep Work</CardTitle>
                    <CardDescription>50 min focus + 10 min break</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Extended focus sessions for complex tasks. Ideal for deep thinking and creative work.
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">50:00</Badge>
                  <Badge variant="outline">10:00</Badge>
                </div>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/timer?mode=deepwork">Start Deep Work</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* View Stats */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Productivity Analytics</CardTitle>
                    <CardDescription>Track your progress and patterns</CardDescription>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href="/stats">View Stats</Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
