"use client"

import { useMemo } from "react"
import { usePomodoro } from "@/context/pomodoro-context"
import { BatmanLogo } from "@/components/batman-logo"
import { Button } from "@/components/ui/button"
import { Clock, Zap, Calendar, Trash2, TrendingUp, Database, Trophy, Target, Lock, Unlock } from "lucide-react"
import { ACHIEVEMENTS } from "@/lib/achievements"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts"

export default function HistoryPage() {
    const {
        sessions, totalFocusHours, todaySessions, bestStreak, settings,
        clearHistory, loadTestData,
        xp, level, unlockedAchievements
    } = usePomodoro()

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const formatDate = (isoString: string) => {
        const date = new Date(isoString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const focusSessions = sessions.filter((s) => s.type === "focus")

    // Calculate current streak
    const currentStreak = useMemo(() => {
        const dates = new Set(focusSessions.map(s => new Date(s.completedAt).toDateString()))
        let streak = 0
        const today = new Date()

        for (let i = 0; i < 365; i++) {
            const date = new Date()
            date.setDate(today.getDate() - i)
            if (dates.has(date.toDateString())) {
                streak++
            } else if (i === 0 && !dates.has(date.toDateString())) {
                continue
            } else {
                break
            }
        }
        return streak
    }, [focusSessions])

    // Calculate weekly data for bar chart
    const weeklyData = useMemo(() => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const now = new Date()
        const data = []

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            const dateStr = date.toDateString()

            const dayHours = focusSessions
                .filter((s) => new Date(s.completedAt).toDateString() === dateStr)
                .reduce((acc, s) => acc + s.duration, 0) / 3600

            data.push({
                day: days[date.getDay()],
                hours: Number(dayHours.toFixed(1)),
                date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            })
        }
        return data
    }, [focusSessions])

    // Calculate Heatmap Data (last 90 days)
    const heatmapData = useMemo(() => {
        const data = []
        const now = new Date()
        const endDate = new Date(now)
        const startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 90)

        // Create map of date -> count
        const sessionMap = new Map<string, number>()
        focusSessions.forEach(s => {
            const dateStr = new Date(s.completedAt).toISOString().split('T')[0]
            sessionMap.set(dateStr, (sessionMap.get(dateStr) || 0) + 1)
        })

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0]
            const count = sessionMap.get(dateStr) || 0

            // Intensity 0-4
            let intensity = 0
            if (count > 0) intensity = 1
            if (count > 2) intensity = 2
            if (count > 5) intensity = 3
            if (count > 8) intensity = 4

            data.push({ date: dateStr, count, intensity })
        }
        return data
    }, [focusSessions])

    // Calculate Productivity Score
    const productivityScore = useMemo(() => {
        let score = 50 // Base score

        // Bonus for sessions today (up to +20)
        score += Math.min(20, todaySessions * 2)

        // Bonus for streak (up to +30)
        score += Math.min(30, currentStreak * 3)

        // Penalty for inactivity in last 7 days
        // Already handled by base score logic implicitly, simpler:

        // Bonus for meeting daily goal
        const dailyGoal = settings.dailyGoal || 8
        if (todaySessions >= dailyGoal) score += 10

        return Math.min(100, Math.max(0, score))
    }, [todaySessions, currentStreak, settings.dailyGoal])

    // Calculate daily trend for area chart (last 14 days)
    const trendData = useMemo(() => {
        const now = new Date()
        const data = []

        for (let i = 13; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            const dateStr = date.toDateString()

            const dayCount = focusSessions
                .filter((s) => new Date(s.completedAt).toDateString() === dateStr)
                .length

            data.push({
                date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                sessions: dayCount,
            })
        }
        return data
    }, [focusSessions])

    return (
        <main className="relative flex min-h-screen flex-col items-center overflow-hidden overflow-y-auto bg-background px-4 pb-24 pt-8">
            {/* Background Pattern */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

            {/* Header */}
            <header className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Mission Report</h1>
                    <p className="text-muted-foreground">Track your progress in protecting the city</p>
                </div>

                {/* Level Display */}
                <div className="flex w-full md:w-auto items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                        {level}
                    </div>
                    <div className="flex flex-col gap-1 min-w-[150px]">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Bat-Level {level}</span>
                            <span className="text-muted-foreground">{xp} XP</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${Math.min(100, (xp % 100))}%` }}
                            />
                        </div>
                    </div>
                    <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-card">
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-primary">{productivityScore}</span>
                            <span className="text-[10px] uppercase text-muted-foreground">Score</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-yellow-500/30 bg-black/50 p-4 backdrop-blur">
                    <Clock className="mb-1 h-4 w-4 text-yellow-400" />
                    <p className="text-2xl font-bold text-white">{totalFocusHours.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">total hours</p>
                </div>
                <div className="rounded-xl border border-yellow-500/30 bg-black/50 p-4 backdrop-blur">
                    <Target className="mb-1 h-4 w-4 text-yellow-400" />
                    <p className="text-2xl font-bold text-white">{todaySessions}/{settings.dailyGoal || 8}</p>
                    <p className="text-xs text-gray-400">daily goal</p>
                </div>
                <div className="rounded-xl border border-yellow-500/30 bg-black/50 p-4 backdrop-blur">
                    <TrendingUp className="mb-1 h-4 w-4 text-yellow-400" />
                    <p className="text-2xl font-bold text-white">{currentStreak}</p>
                    <p className="text-xs text-gray-400">current streak</p>
                </div>
                <div className="rounded-xl border border-yellow-500/30 bg-black/50 p-4 backdrop-blur">
                    <Trophy className="mb-1 h-4 w-4 text-yellow-400" />
                    <p className="text-2xl font-bold text-white">{bestStreak}</p>
                    <p className="text-xs text-gray-400">best streak</p>
                </div>
            </div>

            {/* Weekly Focus Chart */}
            <section className="relative z-10 mb-6 w-full max-w-md">
                <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-yellow-400">
                    Weekly Focus Hours
                </h2>
                <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur">
                    <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#ffffff", fontSize: 11 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#ffffff", fontSize: 11 }}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1f1f1f",
                                    border: "1px solid #404040",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    color: "#ffffff",
                                }}
                                labelStyle={{ color: "#ffffff" }}
                                cursor={{ fill: "rgba(250, 204, 21, 0.2)" }}
                            />
                            <Bar
                                dataKey="hours"
                                fill="#facc15"
                                radius={[4, 4, 0, 0]}
                                name="Hours"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Trend Chart */}
            <section className="relative z-10 mb-6 w-full max-w-md">
                <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-yellow-400">
                    14-Day Trend
                </h2>
                <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur">
                    <ResponsiveContainer width="100%" height={100}>
                        <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#facc15" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={false}
                            />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1f1f1f",
                                    border: "1px solid #404040",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    color: "#ffffff",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sessions"
                                stroke="#facc15"
                                strokeWidth={2}
                                fill="url(#sessionGradient)"
                                name="Sessions"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Heatmap Section */}
            <section className="relative z-10 mb-8 w-full">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-medium uppercase tracking-wider text-yellow-400">Activity Heatmap (Last 90 Days)</h2>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>Less</span>
                        <div className="h-2 w-2 rounded-sm bg-secondary"></div>
                        <div className="h-2 w-2 rounded-sm bg-primary/30"></div>
                        <div className="h-2 w-2 rounded-sm bg-primary/60"></div>
                        <div className="h-2 w-2 rounded-sm bg-primary"></div>
                        <span>More</span>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur overflow-x-auto">
                    <div className="flex gap-1 min-w-max">
                        {/* We display columns of 7 days (weeks) roughly. Actually, heatmaps are usually row=day, col=week. 
                            Let's just do a simple flex wrap grid for simplicity or a strict grid. 
                            Simple grid of small squares.
                        */}
                        <div className="grid grid-flow-col grid-rows-7 gap-1">
                            {heatmapData.map((data, i) => (
                                <div
                                    key={data.date}
                                    title={`${data.date}: ${data.count} sessions`}
                                    className={`h-3 w-3 rounded-sm transition-all hover:scale-125 ${data.intensity === 0 ? "bg-secondary" :
                                            data.intensity === 1 ? "bg-primary/30" :
                                                data.intensity === 2 ? "bg-primary/50" :
                                                    data.intensity === 3 ? "bg-primary/70" :
                                                        "bg-primary"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className="mb-8 space-y-4">
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-xl font-semibold text-foreground">Achievements</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {ACHIEVEMENTS.map((achievement) => {
                        const isUnlocked = unlockedAchievements.includes(achievement.id)
                        const Icon = achievement.icon

                        return (
                            <div
                                key={achievement.id}
                                className={`relative overflow-hidden rounded-xl border p-4 transition-all ${isUnlocked
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-border bg-card/50 opacity-60 grayscale"
                                    }`}
                            >
                                <div className="mb-2 flex justify-between">
                                    <div className={`rounded-full p-2 ${isUnlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    {isUnlocked ? (
                                        <Unlock className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                                <h3 className="font-bold text-foreground">{achievement.title}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                                <span className="text-xs font-mono text-primary">+{achievement.xpReward} XP</span>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Recent Sessions */}
            <section className="relative z-10 w-full max-w-md">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-medium uppercase tracking-wider text-yellow-400">
                        Recent Sessions
                    </h2>
                    {sessions.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearHistory}
                            className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-3 w-3" />
                            Clear
                        </Button>
                    )}
                </div>

                {focusSessions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card/30 p-6 text-center backdrop-blur">
                        <Zap className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground mb-4">
                            No sessions yet. Start focusing!
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadTestData}
                            className="gap-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                        >
                            <Database className="h-4 w-4" />
                            Load Test Data
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {focusSessions.slice(0, 10).map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2 backdrop-blur"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                                        <Zap className="h-3 w-3 text-primary" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">{formatDate(session.completedAt)}</p>
                                </div>
                                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                                    {formatDuration(session.duration)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}
