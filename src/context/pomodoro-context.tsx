"use client"

import React, { createContext, useContext, useCallback, useEffect, useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { loadData, saveData } from "@/lib/data-store"
import { ACHIEVEMENTS, Achievement } from "@/lib/achievements"
import { AmbientSoundType, NOTIFICATION_SOUNDS, DEFAULT_AMBIENT_VOLUME } from "@/lib/audio-config"
import { LofiStationId } from "@/hooks/use-lofi-radio"
import { Theme } from "@/context/theme-context"

// Types
export interface TimerSettings {
    focusMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
    periodsBeforeLongBreak: number
    dailyGoal: number
    soundEnabled: boolean
    autoStartBreaks: boolean
    ambientSound: AmbientSoundType
    ambientVolume: number
    // Discord Rich Presence customization
    discordEnabled: boolean
    discordImageUrl: string
    discordFocusText: string
    discordBreakText: string
    // Lo-fi Radio
    lofiStation: LofiStationId
    lofiVolume: number
}

// Session quality types
export type SessionQuality = 'complete' | 'extended' | 'interrupted' | 'abandoned'

export interface Session {
    id: string
    type: "focus" | "shortBreak" | "longBreak"
    duration: number // in seconds
    completedAt: string // ISO date string
    quality?: SessionQuality // Quality of session (complete, extended, interrupted, abandoned)
    targetDuration?: number // Original target duration in seconds
}


export interface Task {
    id: string
    text: string
    completed: boolean
    createdAt: string
}

export type TimerMode = "focus" | "shortBreak" | "longBreak"

export interface PomodoroContextType {
    // Settings
    settings: TimerSettings
    updateSettings: (settings: Partial<TimerSettings>) => void
    resetSettings: () => void

    // Session tracking
    sessions: Session[]
    addSession: (type: "focus" | "shortBreak" | "longBreak", duration: number, quality?: SessionQuality, targetDuration?: number) => void
    clearHistory: () => void
    loadTestData: () => void

    // Stats
    totalFocusHours: number
    todayFocusHours: number
    todaySessions: number
    bestStreak: number
    currentPeriod: number
    incrementPeriod: () => void
    resetPeriod: () => void
    playSound: (theme?: Theme) => void

    // Timer State (persists across page navigation)
    timerMode: TimerMode
    setTimerMode: (mode: TimerMode) => void
    timeLeft: number
    setTimeLeft: (time: number | ((prev: number) => number)) => void
    isRunning: boolean
    setIsRunning: (running: boolean | ((prev: boolean) => boolean)) => void
    isOvertime: boolean
    setIsOvertime: (overtime: boolean) => void
    overtimeSeconds: number
    setOvertimeSeconds: (seconds: number | ((prev: number) => number)) => void
    completedSessions: number
    setCompletedSessions: (sessions: number | ((prev: number) => number)) => void

    // Gamification
    xp: number
    level: number
    unlockedAchievements: string[]
    recentUnlock: Achievement | null
    dismissUnlock: () => void

    // Window Mode
    isMiniMode: boolean
    setMiniMode: (isMini: boolean) => void

    // Task List
    tasks: Task[]
    activeTaskId: string | null
    addTask: (text: string) => void
    toggleTask: (id: string) => void
    deleteTask: (id: string) => void
    setActiveTask: (id: string | null) => void
}

const DEFAULT_SETTINGS: TimerSettings = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    periodsBeforeLongBreak: 4,
    dailyGoal: 8,
    soundEnabled: true,
    autoStartBreaks: false,
    ambientSound: 'none',
    ambientVolume: DEFAULT_AMBIENT_VOLUME,
    // Discord defaults
    discordEnabled: true,
    discordImageUrl: 'https://i.imgur.com/qLEyaIk.gif',
    discordFocusText: 'Adaptation in Progress 🔄',
    discordBreakText: 'Recovering Energy ✨',
    // Lo-fi Radio defaults
    lofiStation: 'none',
    lofiVolume: 50,
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

// Generate mock test data for development
function generateMockSessions(): Session[] {
    const sessions: Session[] = []
    const now = new Date()

    // Generate sessions over the last 14 days
    for (let day = 0; day < 14; day++) {
        // Random number of sessions per day (0-6)
        const sessionsPerDay = Math.floor(Math.random() * 7)

        for (let s = 0; s < sessionsPerDay; s++) {
            const date = new Date(now)
            date.setDate(date.getDate() - day)
            date.setHours(9 + Math.floor(Math.random() * 10)) // 9am to 7pm
            date.setMinutes(Math.floor(Math.random() * 60))

            sessions.push({
                id: crypto.randomUUID(),
                type: "focus",
                duration: 25 * 60 + Math.floor(Math.random() * 10 * 60), // 25-35 min sessions
                completedAt: date.toISOString(),
            })
        }
    }

    // Sort by date descending
    return sessions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
}

// Use mock data as default for testing (remove for production)
const MOCK_SESSIONS = generateMockSessions()

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useLocalStorage<TimerSettings>("bat-pomodoro-settings", DEFAULT_SETTINGS)
    const [sessions, setSessions] = useLocalStorage<Session[]>("bat-pomodoro-history", [])
    const [currentPeriod, setCurrentPeriod] = React.useState(0)

    // Gamification state
    const [xp, setXp] = useLocalStorage<number>("bat-pomodoro-xp", 0)
    const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<string[]>("bat-pomodoro-achievements", [])
    const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null)
    const [isMiniMode, setIsMiniMode] = useState(false)

    // Task State
    const [tasks, setTasks] = useLocalStorage<Task[]>("bat-pomodoro-tasks", [])
    const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>("bat-pomodoro-active-task", null)

    // Timer State (persists across page navigation)
    const [timerMode, setTimerMode] = useLocalStorage<TimerMode>("bat-pomodoro-timer-mode", "focus")
    const [timeLeft, setTimeLeft] = useLocalStorage<number>("bat-pomodoro-time-left", settings.focusMinutes * 60)
    const [isRunning, setIsRunning] = useLocalStorage<boolean>("bat-pomodoro-is-running", false)
    const [isOvertime, setIsOvertime] = useLocalStorage<boolean>("bat-pomodoro-is-overtime", false)
    const [overtimeSeconds, setOvertimeSeconds] = useLocalStorage<number>("bat-pomodoro-overtime-seconds", 0)
    const [completedSessions, setCompletedSessions] = useLocalStorage<number>("bat-pomodoro-completed-sessions", 0)

    // Persistence State
    const [isDataLoaded, setIsDataLoaded] = useState(false)

    // Load data from disk on mount
    useEffect(() => {
        async function init() {
            const data = await loadData()
            if (data) {
                if (data.xp) setXp(data.xp)
                if (data.tasks) setTasks(data.tasks)
                if (data.activeTaskId) setActiveTaskId(data.activeTaskId)
                if (data.unlockedAchievements) setUnlockedAchievements(data.unlockedAchievements)
                if (data.settings) setSettings(data.settings)
                if (data.focusSessions) setSessions(data.focusSessions)
            }
            setIsDataLoaded(true)
        }
        init()
    }, []) // Run once

    // Save data to disk on change (debounced slightly by nature of React updates, but explicit debounce is better for FS)
    useEffect(() => {
        if (!isDataLoaded) return

        const data = {
            xp,
            tasks,
            activeTaskId,
            unlockedAchievements,
            settings,
            focusSessions: sessions
        }

        // Simple unawaited save (could be debounced in production)
        saveData(data)
    }, [xp, tasks, activeTaskId, unlockedAchievements, settings, sessions, isDataLoaded])

    // Timer interval - runs in context so it persists across page navigation
    useEffect(() => {
        if (!isRunning) return

        const interval = setInterval(() => {
            if (isOvertime) {
                // Counting up in overtime
                setOvertimeSeconds(prev => prev + 1)
            } else if (timeLeft > 0) {
                // Counting down
                setTimeLeft(prev => Math.max(0, prev - 1))
            } else if (timeLeft === 0 && !isOvertime) {
                // Timer just finished - enter overtime mode
                setIsOvertime(true)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [isRunning, isOvertime, timeLeft, setTimeLeft, setOvertimeSeconds, setIsOvertime])

    const level = Math.floor(Math.sqrt(xp / 100)) + 1

    // Calculate stats helper for achievements
    const getStats = useCallback(() => {
        const focusSessions = sessions.filter((s) => s.type === "focus")
        const totalMinutes = focusSessions.reduce((acc, s) => acc + s.duration, 0) / 60

        // Calculate current streak
        const dates = new Set(focusSessions.map(s => new Date(s.completedAt).toDateString()))
        let currentStreak = 0
        const today = new Date()

        // Check today and backwards
        for (let i = 0; i < 365; i++) {
            const date = new Date()
            date.setDate(today.getDate() - i)
            if (dates.has(date.toDateString())) {
                currentStreak++
            } else if (i === 0 && !dates.has(date.toDateString())) {
                // If today has no sessions yet, that's fine, streak continues from yesterday
                continue
            } else {
                break
            }
        }

        // Daily goal met count (simplified approximation)
        const dailyGoalMet = 0 // Needs more complex tracking, skip for now or implement later

        return {
            sessions: focusSessions.length,
            totalMinutes,
            streak: currentStreak,
            dailyGoalMet
        }
    }, [sessions])

    // Task Logic
    const addTask = useCallback((text: string) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        }
        setTasks(prev => [newTask, ...prev])
        // If no active task, set this one
        if (!activeTaskId && tasks.length === 0) {
            setActiveTaskId(newTask.id)
        }
    }, [setTasks, activeTaskId, tasks.length, setActiveTaskId])

    const toggleTask = useCallback((id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    }, [setTasks])

    const deleteTask = useCallback((id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id))
        if (activeTaskId === id) setActiveTaskId(null)
    }, [setTasks, activeTaskId, setActiveTaskId])

    const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }))
    }, [setSettings])

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS)
    }, [setSettings])

    const addSession = useCallback((type: "focus" | "shortBreak" | "longBreak", duration: number, quality?: SessionQuality, targetDuration?: number) => {
        const newSession: Session = {
            id: crypto.randomUUID(),
            type,
            duration,
            completedAt: new Date().toISOString(),
            quality: quality || 'complete',
            targetDuration: targetDuration || duration,
        }

        setSessions((prev) => [newSession, ...prev])

        // Gamification logic
        if (type === "focus") {
            // Award XP: 10 base + 1 per minute
            const minutes = Math.floor(duration / 60)
            const earnedXp = 10 + minutes
            setXp(prev => prev + earnedXp)

            // Check achievements
            // We need updated stats including this new session
            // Since state update is async, we simulate the new stats
            const currentStats = getStats()
            const newStats = {
                ...currentStats,
                sessions: currentStats.sessions + 1,
                totalMinutes: currentStats.totalMinutes + minutes,
                // Streak might increase if this is first session today
            }

            ACHIEVEMENTS.forEach(achievement => {
                if (!unlockedAchievements.includes(achievement.id)) {
                    if (achievement.condition(newStats)) {
                        setUnlockedAchievements(prev => [...prev, achievement.id])
                        setXp(prev => prev + achievement.xpReward)
                        setRecentUnlock(achievement)

                        // Play unlock sound (if sound enabled) which is handled by timer usually, 
                        // but we could add a specific unlock sound here
                    }
                }
            })
        }
    }, [setSessions, setXp, unlockedAchievements, setUnlockedAchievements, getStats, setRecentUnlock])

    const clearHistory = useCallback(() => {
        setSessions([])
    }, [setSessions])

    const loadTestData = useCallback(() => {
        setSessions(generateMockSessions())
    }, [setSessions])

    const incrementPeriod = useCallback(() => {
        setCurrentPeriod((prev) => prev + 1)
    }, [])

    const resetPeriod = useCallback(() => {
        setCurrentPeriod(0)
    }, [])

    // Play completion sound with theme-specific tones
    const playSound = useCallback((theme?: Theme) => {
        if (!settings.soundEnabled) return
        try {
            const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

            // CRITICAL: Resume AudioContext if suspended (browser autoplay policy)
            // Browsers suspend AudioContext until user interaction
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log('🔊 AudioContext resumed')
                }).catch(e => {
                    console.warn('Failed to resume AudioContext:', e)
                })
            }

            // Get theme-specific frequencies (fallback to batman if no theme provided)
            const themeConfig = NOTIFICATION_SOUNDS[theme || 'batman']
            const frequencies = themeConfig.frequencies

            // Play 3 beeps for attention with theme-specific frequencies
            const playBeep = (startTime: number, frequency: number) => {
                const oscillator = audioContext.createOscillator()
                const gainNode = audioContext.createGain()

                oscillator.connect(gainNode)
                gainNode.connect(audioContext.destination)

                oscillator.frequency.setValueAtTime(frequency, startTime)
                gainNode.gain.setValueAtTime(0.5, startTime)
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25)

                oscillator.start(startTime)
                oscillator.stop(startTime + 0.25)
            }

            // Three themed beeps
            playBeep(audioContext.currentTime, frequencies[0])
            playBeep(audioContext.currentTime + 0.3, frequencies[1])
            playBeep(audioContext.currentTime + 0.6, frequencies[2])

            console.log(`🔊 ${themeConfig.name} sound played!`)
        } catch (e) {
            console.warn('Audio not supported:', e)
        }
    }, [settings.soundEnabled])

    // Calculate stats
    const focusSessions = sessions.filter((s) => s.type === "focus")
    const totalFocusHours = focusSessions.reduce((acc, s) => acc + s.duration, 0) / 3600

    const today = new Date().toDateString()
    const todaysSessions = focusSessions.filter(
        (s) => new Date(s.completedAt).toDateString() === today
    )
    const todaySessions = todaysSessions.length
    const todayFocusHours = todaysSessions.reduce((acc, s) => acc + s.duration, 0) / 3600

    // Calculate best streak
    const bestStreak = (() => {
        let maxStreak = 0
        let currentStreak = 0
        const dates = new Set(focusSessions.map(s => new Date(s.completedAt).toDateString()))

        for (let i = 365; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            if (dates.has(date.toDateString())) {
                currentStreak++
                maxStreak = Math.max(maxStreak, currentStreak)
            } else {
                currentStreak = 0
            }
        }
        return maxStreak
    })()

    return (
        <PomodoroContext.Provider
            value={{
                settings,
                updateSettings,
                resetSettings,
                sessions,
                addSession,
                clearHistory,
                loadTestData,
                totalFocusHours,
                todayFocusHours,
                todaySessions,
                bestStreak,
                currentPeriod,
                incrementPeriod,
                resetPeriod,
                playSound,
                // Timer State
                timerMode,
                setTimerMode,
                timeLeft,
                setTimeLeft,
                isRunning,
                setIsRunning,
                isOvertime,
                setIsOvertime,
                overtimeSeconds,
                setOvertimeSeconds,
                completedSessions,
                setCompletedSessions,
                // Gamification
                unlockedAchievements,
                xp,
                level,
                recentUnlock,
                dismissUnlock: () => setRecentUnlock(null),
                isMiniMode,
                setMiniMode: setIsMiniMode,
                tasks,
                activeTaskId,
                addTask,
                toggleTask,
                deleteTask,
                setActiveTask: setActiveTaskId
            }}
        >
            {children}
        </PomodoroContext.Provider>
    )
}

export function usePomodoro() {
    const context = useContext(PomodoroContext)
    if (context === undefined) {
        throw new Error("usePomodoro must be used within a PomodoroProvider")
    }
    return context
}
