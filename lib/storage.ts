export interface StudySession {
  id: string
  type: "focus" | "break"
  mode: "pomodoro" | "deepwork"
  duration: number // in seconds
  timestamp: number
}

export interface StudyStats {
  totalFocusTime: number
  totalBreakTime: number
  sessionsToday: StudySession[]
  sessionsThisWeek: StudySession[]
}

const STORAGE_KEY = "focusflow-sessions"

export function saveSessions(sessions: StudySession[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }
}

export function loadSessions(): StudySession[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addSession(session: Omit<StudySession, "id">): void {
  const sessions = loadSessions()
  const newSession: StudySession = {
    ...session,
    id: Date.now().toString(),
  }
  sessions.push(newSession)
  saveSessions(sessions)
}

export function getStats(): StudyStats {
  const sessions = loadSessions()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime()

  const sessionsToday = sessions.filter((s) => s.timestamp >= todayStart)
  const sessionsThisWeek = sessions.filter((s) => s.timestamp >= weekStart)

  const totalFocusTime = sessionsThisWeek.filter((s) => s.type === "focus").reduce((sum, s) => sum + s.duration, 0)

  const totalBreakTime = sessionsThisWeek.filter((s) => s.type === "break").reduce((sum, s) => sum + s.duration, 0)

  return {
    totalFocusTime,
    totalBreakTime,
    sessionsToday,
    sessionsThisWeek,
  }
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function formatTimerDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}
