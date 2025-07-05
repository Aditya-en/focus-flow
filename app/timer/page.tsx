"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { addSession, formatTimerDisplay } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Play, Pause, RotateCcw, Timer, Brain, Coffee, Target } from "lucide-react"

type TimerMode = "pomodoro" | "deepwork"
type SessionType = "focus" | "break"

const TIMER_CONFIGS = {
  pomodoro: { focus: 25 * 60, break: 5 * 60 },
  deepwork: { focus: 50 * 60, break: 10 * 60 },
}

export default function TimerPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [mode, setMode] = useState<TimerMode>("pomodoro")
  const [sessionType, setSessionType] = useState<SessionType>("focus")
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIGS.pomodoro.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize from URL params
  useEffect(() => {
    const urlMode = searchParams.get("mode") as TimerMode
    if (urlMode && (urlMode === "pomodoro" || urlMode === "deepwork")) {
      setMode(urlMode)
      setTimeLeft(TIMER_CONFIGS[urlMode].focus)
    }
  }, [searchParams])

  // Create audio context for notifications
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const createBeepSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }

    audioRef.current = { play: createBeepSound } as any
  }, [])

  const playNotificationSound = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.play()
      }
    } catch (error) {
      console.log("Could not play notification sound")
    }
  }, [])

  const switchSession = useCallback(() => {
    const currentDuration = TIMER_CONFIGS[mode][sessionType] - timeLeft

    // Save completed session
    addSession({
      type: sessionType,
      mode,
      duration: currentDuration,
      timestamp: Date.now(),
    })

    playNotificationSound()

    if (sessionType === "focus") {
      setSessionType("break")
      setTimeLeft(TIMER_CONFIGS[mode].break)
      setSessionCount((prev) => prev + 1)
      toast({
        title: "Focus session complete! 🎉",
        description: "Time for a well-deserved break.",
      })
    } else {
      setSessionType("focus")
      setTimeLeft(TIMER_CONFIGS[mode].focus)
      toast({
        title: "Break time over! 💪",
        description: "Ready for another focus session?",
      })
    }

    setIsRunning(false)
  }, [mode, sessionType, timeLeft, playNotificationSound, toast])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            switchSession()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, switchSession])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(TIMER_CONFIGS[mode][sessionType])
  }

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    setSessionType("focus")
    setTimeLeft(TIMER_CONFIGS[newMode].focus)
    setSessionCount(0)
    router.push(`/timer?mode=${newMode}`)
  }

  const totalTime = TIMER_CONFIGS[mode][sessionType]
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Mode Selection */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant={mode === "pomodoro" ? "default" : "outline"}
              onClick={() => switchMode("pomodoro")}
              className="flex items-center space-x-2"
              disabled={isRunning}
            >
              <Timer className="h-4 w-4" />
              <span>Pomodoro</span>
            </Button>
            <Button
              variant={mode === "deepwork" ? "default" : "outline"}
              onClick={() => switchMode("deepwork")}
              className="flex items-center space-x-2"
              disabled={isRunning}
            >
              <Brain className="h-4 w-4" />
              <span>Deep Work</span>
            </Button>
          </div>

          {/* Timer Card */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                {sessionType === "focus" ? (
                  <Target className="h-6 w-6 text-blue-600" />
                ) : (
                  <Coffee className="h-6 w-6 text-green-600" />
                )}
                <CardTitle className="text-2xl">{sessionType === "focus" ? "Focus Time" : "Break Time"}</CardTitle>
              </div>
              <CardDescription>{mode === "pomodoro" ? "Pomodoro Technique" : "Deep Work Session"}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Timer Display */}
              <div className="text-center space-y-4">
                <div className="text-6xl sm:text-8xl font-mono font-bold text-primary">
                  {formatTimerDisplay(timeLeft)}
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              {/* Session Info */}
              <div className="flex justify-center space-x-4">
                <Badge variant="secondary" className="text-sm">
                  Session {sessionCount + 1}
                </Badge>
                <Badge variant={sessionType === "focus" ? "default" : "outline"} className="text-sm">
                  {sessionType === "focus" ? "Focus" : "Break"}
                </Badge>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                <Button onClick={toggleTimer} size="lg" className="flex items-center space-x-2 px-8">
                  {isRunning ? (
                    <>
                      <Pause className="h-5 w-5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Start</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetTimer}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Reset</span>
                </Button>
              </div>

              {/* Tips */}
              <div className="text-center text-sm text-muted-foreground space-y-2">
                {sessionType === "focus" ? (
                  <div>
                    <p>
                      💡 <strong>Focus Tips:</strong>
                    </p>
                    <p>Remove distractions, stay hydrated, and concentrate on one task</p>
                  </div>
                ) : (
                  <div>
                    <p>
                      ☕ <strong>Break Tips:</strong>
                    </p>
                    <p>Step away from your screen, stretch, or take deep breaths</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
