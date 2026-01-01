import { Session, SessionQuality } from "@/context/pomodoro-context"

export interface QualityBreakdown {
    complete: number // % of sessions completed normally
    extended: number // % of sessions with overtime (flow state)
    interrupted: number // % of sessions stopped early (<50%)
    abandoned: number // % of sessions <10 min
}

export interface FocusInsights {
    // Core stats
    bestHour: number | null
    bestHourLabel: string
    averageSessionLength: number
    completionRate: number
    totalFocusTime: number
    streakDays: number
    productivityScore: number

    // Suggested settings
    suggestedFocusMinutes: number
    suggestedBreakMinutes: number

    // Advanced insights
    flowStateFrequency: number // % of sessions that went into overtime
    energyPattern: 'morning' | 'afternoon' | 'evening' | 'consistent' | 'unknown'
    fatigueWarning: string | null
    ultradianRecommended: boolean // Should user try 90-min cycles?

    // Quality tracking
    qualityBreakdown: QualityBreakdown
    bestDayOfWeek: string | null
    predictiveTips: string[]

    // Messages
    motivationalMessage: string
}

export interface EnergyByPeriod {
    morning: { count: number; avgDuration: number; completionRate: number }   // 5-12
    afternoon: { count: number; avgDuration: number; completionRate: number }  // 12-17
    evening: { count: number; avgDuration: number; completionRate: number }    // 17-22
}

// Analyze session history with advanced algorithms
export function analyzeSessions(sessions: Session[]): FocusInsights {
    const focusSessions = sessions.filter(s => s.type === 'focus')

    if (focusSessions.length === 0) {
        return getEmptyInsights()
    }

    // Core calculations
    const hourCounts = getHourDistribution(focusSessions)
    const bestHour = findBestHour(hourCounts)
    const avgLength = calculateAverageLength(focusSessions)
    const completionRate = calculateCompletionRate(focusSessions)
    const totalFocusTime = calculateTotalTime(focusSessions)
    const streakDays = calculateStreak(focusSessions)

    // Advanced: Flow state detection
    // Sessions > 30 min indicate possible flow state
    const flowSessions = focusSessions.filter(s => s.duration >= 30 * 60)
    const flowStateFrequency = (flowSessions.length / focusSessions.length) * 100

    // Advanced: Energy pattern analysis
    const energyByPeriod = analyzeEnergyByPeriod(focusSessions)
    const energyPattern = determineEnergyPattern(energyByPeriod)

    // Advanced: Fatigue prediction
    const fatigueWarning = predictFatigue(focusSessions, energyByPeriod)

    // Advanced: Ultradian recommendation
    // Recommend 90-min cycles if avg session is > 35 min or flow state > 30%
    const ultradianRecommended = avgLength >= 35 || flowStateFrequency >= 30

    // Adaptive duration algorithm
    const { suggestedFocus, suggestedBreak } = calculateAdaptiveDuration(
        focusSessions,
        avgLength,
        flowStateFrequency,
        ultradianRecommended
    )

    // Productivity score (improved algorithm)
    const productivityScore = calculateAdvancedScore(
        completionRate,
        streakDays,
        totalFocusTime,
        flowStateFrequency
    )

    // Calculate quality breakdown
    const qualityBreakdown = calculateQualityBreakdown(focusSessions)

    // Best day of week analysis
    const bestDayOfWeek = findBestDayOfWeek(focusSessions)

    // Generate predictive tips
    const predictiveTips = generatePredictiveTips(
        focusSessions,
        avgLength,
        qualityBreakdown,
        energyPattern,
        bestDayOfWeek
    )

    // Generate message
    const motivationalMessage = generateAdvancedMessage(
        productivityScore,
        streakDays,
        energyPattern,
        flowStateFrequency
    )

    return {
        bestHour,
        bestHourLabel: bestHour !== null ? formatHour(bestHour) : 'Not enough data',
        averageSessionLength: Math.round(avgLength),
        completionRate: Math.round(completionRate),
        totalFocusTime: Math.round(totalFocusTime),
        streakDays,
        productivityScore,
        suggestedFocusMinutes: suggestedFocus,
        suggestedBreakMinutes: suggestedBreak,
        flowStateFrequency: Math.round(flowStateFrequency),
        energyPattern,
        fatigueWarning,
        ultradianRecommended,
        qualityBreakdown,
        bestDayOfWeek,
        predictiveTips,
        motivationalMessage
    }
}

// Empty insights for new users
function getEmptyInsights(): FocusInsights {
    return {
        bestHour: null,
        bestHourLabel: 'Start focusing to discover!',
        averageSessionLength: 25,
        completionRate: 0,
        totalFocusTime: 0,
        streakDays: 0,
        productivityScore: 0,
        suggestedFocusMinutes: 25,
        suggestedBreakMinutes: 5,
        flowStateFrequency: 0,
        energyPattern: 'unknown',
        fatigueWarning: null,
        ultradianRecommended: false,
        qualityBreakdown: { complete: 0, extended: 0, interrupted: 0, abandoned: 0 },
        bestDayOfWeek: null,
        predictiveTips: ['🦇 Complete a few sessions to unlock personalized insights!'],
        motivationalMessage: "Ready to begin your focus journey? 🦇"
    }
}

// Hour distribution analysis
function getHourDistribution(sessions: Session[]): Record<number, number> {
    const hourCounts: Record<number, number> = {}
    sessions.forEach(session => {
        const hour = new Date(session.completedAt).getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    return hourCounts
}

function findBestHour(hourCounts: Record<number, number>): number | null {
    const entries = Object.entries(hourCounts)
    if (entries.length === 0) return null
    const best = entries.sort(([, a], [, b]) => b - a)[0]
    return parseInt(best[0])
}

function formatHour(hour: number): string {
    if (hour === 0) return "12 AM"
    if (hour === 12) return "12 PM"
    if (hour < 12) return `${hour} AM`
    return `${hour - 12} PM`
}

// Core calculations
function calculateAverageLength(sessions: Session[]): number {
    return sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length / 60
}

function calculateCompletionRate(sessions: Session[]): number {
    // Sessions >= 20 min are "complete"
    const completed = sessions.filter(s => s.duration >= 20 * 60)
    return (completed.length / sessions.length) * 100
}

function calculateTotalTime(sessions: Session[]): number {
    return sessions.reduce((sum, s) => sum + s.duration, 0) / 60
}

function calculateStreak(sessions: Session[]): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let streakDays = 0
    let checkDate = new Date(today)

    while (true) {
        const dayStart = new Date(checkDate)
        const dayEnd = new Date(checkDate)
        dayEnd.setDate(dayEnd.getDate() + 1)

        const hasSession = sessions.some(s => {
            const sessionDate = new Date(s.completedAt)
            return sessionDate >= dayStart && sessionDate < dayEnd
        })

        if (hasSession) {
            streakDays++
            checkDate.setDate(checkDate.getDate() - 1)
        } else {
            break
        }
    }
    return streakDays
}

// Advanced: Energy pattern analysis
function analyzeEnergyByPeriod(sessions: Session[]): EnergyByPeriod {
    const periods: EnergyByPeriod = {
        morning: { count: 0, avgDuration: 0, completionRate: 0 },
        afternoon: { count: 0, avgDuration: 0, completionRate: 0 },
        evening: { count: 0, avgDuration: 0, completionRate: 0 }
    }

    const buckets = { morning: [] as Session[], afternoon: [] as Session[], evening: [] as Session[] }

    sessions.forEach(s => {
        const hour = new Date(s.completedAt).getHours()
        if (hour >= 5 && hour < 12) buckets.morning.push(s)
        else if (hour >= 12 && hour < 17) buckets.afternoon.push(s)
        else if (hour >= 17 && hour < 22) buckets.evening.push(s)
    })

    for (const [period, bucket] of Object.entries(buckets)) {
        if (bucket.length > 0) {
            const p = period as keyof EnergyByPeriod
            periods[p].count = bucket.length
            periods[p].avgDuration = bucket.reduce((sum, s) => sum + s.duration, 0) / bucket.length / 60
            periods[p].completionRate = bucket.filter(s => s.duration >= 20 * 60).length / bucket.length * 100
        }
    }

    return periods
}

function determineEnergyPattern(energy: EnergyByPeriod): 'morning' | 'afternoon' | 'evening' | 'consistent' | 'unknown' {
    const { morning, afternoon, evening } = energy
    const total = morning.count + afternoon.count + evening.count

    if (total < 3) return 'unknown'

    // Check for dominance (>50% of sessions in one period)
    if (morning.count / total > 0.5) return 'morning'
    if (afternoon.count / total > 0.5) return 'afternoon'
    if (evening.count / total > 0.5) return 'evening'

    // Check completion rates for best period
    const rates = [
        { period: 'morning' as const, rate: morning.completionRate, count: morning.count },
        { period: 'afternoon' as const, rate: afternoon.completionRate, count: afternoon.count },
        { period: 'evening' as const, rate: evening.completionRate, count: evening.count }
    ].filter(p => p.count >= 2)

    if (rates.length === 0) return 'unknown'

    const best = rates.sort((a, b) => b.rate - a.rate)[0]
    const worst = rates.sort((a, b) => a.rate - b.rate)[0]

    // If difference > 20%, there's a clear pattern
    if (best.rate - worst.rate > 20) return best.period

    return 'consistent'
}

// Advanced: Fatigue prediction
function predictFatigue(sessions: Session[], energy: EnergyByPeriod): string | null {
    // Check for declining completion rates in later periods
    if (energy.afternoon.count >= 2 && energy.evening.count >= 2) {
        if (energy.evening.completionRate < energy.afternoon.completionRate - 20) {
            return "⚠️ Your focus drops significantly in the evening. Schedule important tasks earlier."
        }
    }

    // Check for very short recent sessions
    const recentSessions = sessions
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 5)

    const avgRecentDuration = recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length / 60

    if (avgRecentDuration < 15 && recentSessions.length >= 3) {
        return "💤 Your recent sessions are shorter than usual. Consider taking a longer break."
    }

    return null
}

// Advanced: Adaptive duration algorithm
function calculateAdaptiveDuration(
    sessions: Session[],
    avgLength: number,
    flowFrequency: number,
    ultradianRecommended: boolean
): { suggestedFocus: number; suggestedBreak: number } {
    // Recent sessions weighted more heavily
    const recentSessions = sessions
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 10)

    const recentAvg = recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length / 60
        : avgLength

    // Adaptive algorithm:
    // 60% recent performance + 30% historical average + 10% flow adjustment
    let suggested = (recentAvg * 0.6) + (avgLength * 0.3)

    // Boost for high flow frequency
    if (flowFrequency > 40) {
        suggested += 10
    }

    // Ultradian mode: if recommended and avg is close to 45+, suggest 90
    if (ultradianRecommended && avgLength >= 40) {
        return { suggestedFocus: 90, suggestedBreak: 20 }
    }

    // Round to nearest 5, clamp between 15 and 90
    const focusMin = Math.round(Math.min(Math.max(suggested, 15), 90) / 5) * 5

    // Break duration: 1/5 of focus time, minimum 5
    const breakMin = Math.max(5, Math.round(focusMin / 5))

    return { suggestedFocus: focusMin, suggestedBreak: breakMin }
}

// Advanced: Productivity score with flow state bonus
function calculateAdvancedScore(
    completionRate: number,
    streakDays: number,
    totalTime: number,
    flowFrequency: number
): number {
    // Weighted components:
    // - Completion rate: 25%
    // - Streak (up to 7 days): 25%
    // - Total time (up to 10 hours): 25%
    // - Flow state frequency: 25%

    const completionScore = completionRate * 0.25
    const streakScore = Math.min(streakDays, 7) / 7 * 25
    const timeScore = Math.min(totalTime / 60, 10) / 10 * 25
    const flowScore = Math.min(flowFrequency, 100) * 0.25

    return Math.min(100, Math.round(completionScore + streakScore + timeScore + flowScore))
}

// Advanced: Personalized messages
function generateAdvancedMessage(
    score: number,
    streak: number,
    energyPattern: string,
    flowFrequency: number
): string {
    if (streak >= 7) return "🔥 Incredible 7-day streak! You're unstoppable!"
    if (flowFrequency > 50) return "🌊 You enter flow state often! Consider longer sessions."
    if (streak >= 3) return `💪 ${streak}-day streak! Keep the momentum going!`
    if (score >= 80) return "🌟 Outstanding focus! You're in the zone!"
    if (score >= 50) return "📈 Great progress! You're getting stronger!"

    if (energyPattern === 'morning') return "☀️ You're a morning person! Schedule deep work early."
    if (energyPattern === 'afternoon') return "🌤️ You peak in the afternoon. Plan accordingly!"
    if (energyPattern === 'evening') return "🌙 Night owl detected! Embrace your evening focus."

    return "🦇 Every session counts. Start your next one!"
}

// Get personalized suggestions
export function getSuggestions(insights: FocusInsights): string[] {
    const suggestions: string[] = []

    // Peak hour suggestion
    if (insights.bestHour !== null) {
        const timeStr = formatHour(insights.bestHour)
        suggestions.push(`📍 Your peak focus hour is around ${timeStr}`)
    }

    // Flow state insight
    if (insights.flowStateFrequency > 30) {
        suggestions.push(`🌊 You enter flow state ${insights.flowStateFrequency}% of the time - try longer sessions!`)
    }

    // Ultradian recommendation
    if (insights.ultradianRecommended) {
        suggestions.push("🧠 Based on your patterns, try 90-minute ultradian focus cycles")
    }

    // Energy pattern advice
    if (insights.energyPattern === 'morning') {
        suggestions.push("☀️ You're most productive in the morning - schedule hard tasks early")
    } else if (insights.energyPattern === 'evening') {
        suggestions.push("🌙 You thrive in the evening - protect that time for deep work")
    }

    // Session length advice
    if (insights.averageSessionLength < 20) {
        suggestions.push("⏱️ Try longer sessions (25+ min) for deeper focus")
    }

    // Fatigue warning
    if (insights.fatigueWarning) {
        suggestions.push(insights.fatigueWarning)
    }

    // Completion rate
    if (insights.completionRate < 60) {
        suggestions.push("🎯 Try shorter sessions to improve your completion rate")
    }

    // Streak motivation
    if (insights.streakDays === 0) {
        suggestions.push("🔥 Start a streak by focusing today!")
    }

    return suggestions.slice(0, 4) // Max 4 suggestions
}

// Calculate session quality breakdown percentages
function calculateQualityBreakdown(sessions: Session[]): QualityBreakdown {
    if (sessions.length === 0) {
        return { complete: 0, extended: 0, interrupted: 0, abandoned: 0 }
    }

    const counts = { complete: 0, extended: 0, interrupted: 0, abandoned: 0 }

    sessions.forEach(s => {
        if (s.quality) {
            counts[s.quality]++
        } else {
            // Legacy sessions without quality field - infer from duration
            if (s.duration >= 30 * 60) {
                counts.extended++
            } else if (s.duration >= 20 * 60) {
                counts.complete++
            } else if (s.duration >= 10 * 60) {
                counts.interrupted++
            } else {
                counts.abandoned++
            }
        }
    })

    const total = sessions.length
    return {
        complete: Math.round((counts.complete / total) * 100),
        extended: Math.round((counts.extended / total) * 100),
        interrupted: Math.round((counts.interrupted / total) * 100),
        abandoned: Math.round((counts.abandoned / total) * 100)
    }
}

// Find the best day of week based on session count and quality
function findBestDayOfWeek(sessions: Session[]): string | null {
    if (sessions.length < 7) return null

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayCounts: Record<number, { count: number; totalDuration: number }> = {}

    sessions.forEach(s => {
        const day = new Date(s.completedAt).getDay()
        if (!dayCounts[day]) {
            dayCounts[day] = { count: 0, totalDuration: 0 }
        }
        dayCounts[day].count++
        dayCounts[day].totalDuration += s.duration
    })

    let bestDay = -1
    let bestScore = 0

    Object.entries(dayCounts).forEach(([day, data]) => {
        // Score = count * avg duration / 60 (weighted by both frequency and length)
        const avgDuration = data.totalDuration / data.count / 60
        const score = data.count * avgDuration
        if (score > bestScore) {
            bestScore = score
            bestDay = parseInt(day)
        }
    })

    return bestDay >= 0 ? dayNames[bestDay] : null
}

// Generate predictive, actionable tips based on patterns
function generatePredictiveTips(
    sessions: Session[],
    avgLength: number,
    quality: QualityBreakdown,
    energyPattern: string,
    bestDay: string | null
): string[] {
    const tips: string[] = []

    if (sessions.length < 3) {
        return ['🦇 Complete more sessions to unlock AI-powered insights!']
    }

    // High abandonment rate insight
    if (quality.abandoned > 20) {
        tips.push(`⚠️ ${quality.abandoned}% of sessions are under 10 min. Try starting with 15-min sessions.`)
    }

    // High flow state insight
    if (quality.extended > 30) {
        tips.push(`🌊 You hit flow state ${quality.extended}% of the time! Consider 45-min sessions.`)
    }

    // Interrupted sessions insight
    if (quality.interrupted > 25) {
        tips.push(`🎯 ${quality.interrupted}% interrupted. Try the "2-minute rule" - if distracted, wait 2 min.`)
    }

    // Day of week optimization
    if (bestDay) {
        tips.push(`📅 ${bestDay} is your power day - schedule important work then!`)
    }

    // Session length optimization
    if (avgLength > 35 && avgLength < 45) {
        tips.push(`⏰ Your avg is ${Math.round(avgLength)} min - bump to 45 for natural flow cycles.`)
    } else if (avgLength < 20) {
        tips.push(`⏱️ Average of ${Math.round(avgLength)} min is low. Try 25-min Pomodoros.`)
    }

    // Energy pattern tips
    if (energyPattern === 'morning') {
        tips.push(`☀️ Morning peak detected - front-load your hardest tasks!`)
    } else if (energyPattern === 'evening') {
        tips.push(`🌙 Evening owl mode - save creative work for after 5pm.`)
    }

    // Recent trend analysis
    const recent5 = sessions.slice(0, 5)
    const older5 = sessions.slice(5, 10)
    if (recent5.length >= 5 && older5.length >= 5) {
        const recentAvg = recent5.reduce((sum, s) => sum + s.duration, 0) / 5 / 60
        const olderAvg = older5.reduce((sum, s) => sum + s.duration, 0) / 5 / 60

        if (recentAvg < olderAvg * 0.7) {
            tips.push(`📉 Recent sessions are ${Math.round((1 - recentAvg / olderAvg) * 100)}% shorter. Need a break?`)
        } else if (recentAvg > olderAvg * 1.3) {
            tips.push(`📈 You're ${Math.round((recentAvg / olderAvg - 1) * 100)}% more focused lately! Keep it up!`)
        }
    }

    return tips.slice(0, 4) // Max 4 tips
}
