"use client"

import { useMemo } from "react"
import { BatmanLogo } from "@/components/batman-logo"
import { Brain, Clock, Flame, TrendingUp, Target, Zap, Activity, Sun, Moon, Sunset, AlertTriangle } from "lucide-react"
import { usePomodoro } from "@/context/pomodoro-context"
import { analyzeSessions, getSuggestions } from "@/lib/focus-coach"

export default function CoachPage() {
    const { sessions, settings, updateSettings } = usePomodoro()

    // AI Focus Coach analysis
    const focusInsights = useMemo(() => analyzeSessions(sessions), [sessions])
    const suggestions = useMemo(() => getSuggestions(focusInsights), [focusInsights])

    // Energy pattern icon
    const EnergyIcon = {
        morning: Sun,
        afternoon: Sunset,
        evening: Moon,
        consistent: Activity,
        unknown: Activity
    }[focusInsights.energyPattern]

    const energyLabel = {
        morning: 'Morning Person',
        afternoon: 'Afternoon Peak',
        evening: 'Night Owl',
        consistent: 'Consistent',
        unknown: 'Analyzing...'
    }[focusInsights.energyPattern]

    return (
        <main className="relative flex min-h-screen flex-col items-center overflow-y-auto overflow-hidden bg-background px-4 pb-24 pt-8">
            {/* Background Pattern */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

            {/* Header */}
            <header className="relative z-10 mb-8 flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 blur-2xl">
                        <BatmanLogo className="h-12 w-auto text-primary/50" />
                    </div>
                    <BatmanLogo className="relative h-12 w-auto text-primary" />
                </div>
                <div className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Focus Coach</h1>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                    Research-backed insights powered by ultradian rhythm analysis
                </p>
            </header>

            {/* Main Stats Card */}
            <section className="relative z-10 w-full max-w-md mb-6">
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Your Stats
                    </h2>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="rounded-lg bg-secondary/30 p-4 text-center">
                            <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                            <div className="text-2xl font-bold text-foreground">{focusInsights.bestHourLabel}</div>
                            <div className="text-xs text-muted-foreground">Peak Hour</div>
                        </div>
                        <div className="rounded-lg bg-secondary/30 p-4 text-center">
                            <Flame className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                            <div className="text-2xl font-bold text-foreground">{focusInsights.streakDays}</div>
                            <div className="text-xs text-muted-foreground">Day Streak</div>
                        </div>
                        <div className="rounded-lg bg-secondary/30 p-4 text-center">
                            <Target className="h-5 w-5 mx-auto mb-2 text-green-500" />
                            <div className="text-2xl font-bold text-foreground">{focusInsights.completionRate}%</div>
                            <div className="text-xs text-muted-foreground">Completion Rate</div>
                        </div>
                        <div className="rounded-lg bg-secondary/30 p-4 text-center">
                            <Zap className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
                            <div className="text-2xl font-bold text-foreground">{focusInsights.productivityScore}</div>
                            <div className="text-xs text-muted-foreground">Productivity Score</div>
                        </div>
                    </div>

                    {/* Total Focus Time */}
                    <div className="rounded-lg bg-primary/10 p-4 text-center">
                        <div className="text-3xl font-bold text-primary">
                            {Math.floor(focusInsights.totalFocusTime / 60)}h {Math.round(focusInsights.totalFocusTime % 60)}m
                        </div>
                        <div className="text-sm text-muted-foreground">Total Focus Time</div>
                    </div>
                </div>
            </section>

            {/* Advanced Insights */}
            <section className="relative z-10 w-full max-w-md mb-6">
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Advanced Insights
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Flow State */}
                        <div className="rounded-lg bg-blue-500/10 p-4 text-center">
                            <div className="text-2xl font-bold text-blue-400">{focusInsights.flowStateFrequency}%</div>
                            <div className="text-xs text-muted-foreground">Flow State Rate</div>
                            <div className="text-[10px] text-blue-400/60 mt-1">Sessions &gt;30min</div>
                        </div>

                        {/* Energy Pattern */}
                        <div className="rounded-lg bg-purple-500/10 p-4 text-center">
                            <EnergyIcon className="h-5 w-5 mx-auto mb-1 text-purple-400" />
                            <div className="text-sm font-bold text-purple-400">{energyLabel}</div>
                            <div className="text-xs text-muted-foreground">Energy Pattern</div>
                        </div>
                    </div>

                    {/* Ultradian Recommendation */}
                    {focusInsights.ultradianRecommended && (
                        <div className="mt-4 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">Ultradian Mode Recommended</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Based on your flow patterns, try 90-minute focus cycles with 20-minute breaks for optimal performance.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Session Quality Breakdown */}
            <section className="relative z-10 w-full max-w-md mb-6">
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Session Quality
                    </h2>

                    <div className="space-y-3">
                        {/* Extended (Flow) */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-blue-400">🌊 Extended (Flow)</span>
                                <span className="text-muted-foreground">{focusInsights.qualityBreakdown.extended}%</span>
                            </div>
                            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${focusInsights.qualityBreakdown.extended}%` }}
                                />
                            </div>
                        </div>

                        {/* Complete */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-green-400">✅ Complete</span>
                                <span className="text-muted-foreground">{focusInsights.qualityBreakdown.complete}%</span>
                            </div>
                            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${focusInsights.qualityBreakdown.complete}%` }}
                                />
                            </div>
                        </div>

                        {/* Interrupted */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-yellow-400">⚡ Interrupted</span>
                                <span className="text-muted-foreground">{focusInsights.qualityBreakdown.interrupted}%</span>
                            </div>
                            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                                    style={{ width: `${focusInsights.qualityBreakdown.interrupted}%` }}
                                />
                            </div>
                        </div>

                        {/* Abandoned */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-red-400">❌ Abandoned</span>
                                <span className="text-muted-foreground">{focusInsights.qualityBreakdown.abandoned}%</span>
                            </div>
                            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                                    style={{ width: `${focusInsights.qualityBreakdown.abandoned}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Best Day */}
                    {focusInsights.bestDayOfWeek && (
                        <div className="mt-4 rounded-lg bg-green-500/10 p-3 text-center">
                            <div className="text-sm font-medium text-green-400">📅 {focusInsights.bestDayOfWeek}</div>
                            <div className="text-xs text-muted-foreground">Your Power Day</div>
                        </div>
                    )}
                </div>
            </section>

            {/* Predictive Tips */}
            <section className="relative z-10 w-full max-w-md mb-6">
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        AI Predictions
                    </h2>

                    <div className="space-y-3">
                        {focusInsights.predictiveTips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10">
                                <span className="text-lg">{tip.split(' ')[0]}</span>
                                <p className="text-sm text-muted-foreground">
                                    {tip.split(' ').slice(1).join(' ')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Fatigue Warning */}
            {focusInsights.fatigueWarning && (
                <section className="relative z-10 w-full max-w-md mb-6">
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-200">{focusInsights.fatigueWarning}</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Motivational Message */}
            <section className="relative z-10 w-full max-w-md mb-6">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                    <p className="text-lg font-medium text-foreground">
                        {focusInsights.motivationalMessage}
                    </p>
                </div>
            </section>

            {/* AI Recommendations */}
            <section className="relative z-10 w-full max-w-md mb-6">
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Personalized Recommendations
                    </h2>

                    {suggestions.length > 0 ? (
                        <div className="space-y-3">
                            {suggestions.map((suggestion, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                                    <span className="text-lg">{suggestion.split(' ')[0]}</span>
                                    <p className="text-sm text-muted-foreground">
                                        {suggestion.split(' ').slice(1).join(' ')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Complete more focus sessions to unlock personalized insights!
                        </p>
                    )}
                </div>
            </section>

            {/* Suggested Settings */}
            <section className="relative z-10 w-full max-w-md">
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4">AI-Suggested Timer Settings</h2>

                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Focus Duration</span>
                        <span className="text-lg font-bold text-primary">
                            {focusInsights.suggestedFocusMinutes} min
                        </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted-foreground">Break Duration</span>
                        <span className="text-lg font-bold text-primary">
                            {focusInsights.suggestedBreakMinutes} min
                        </span>
                    </div>

                    {focusInsights.ultradianRecommended && (
                        <p className="text-xs text-muted-foreground mb-4 text-center">
                            🧠 Based on ultradian rhythm research (90-min cycles)
                        </p>
                    )}

                    <button
                        onClick={() => {
                            updateSettings({
                                focusMinutes: focusInsights.suggestedFocusMinutes,
                                shortBreakMinutes: focusInsights.suggestedBreakMinutes
                            })
                        }}
                        className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                        Apply Suggested Settings
                    </button>
                </div>
            </section>
        </main>
    )
}
