"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { usePomodoro, TimerMode } from "@/context/pomodoro-context"
import { useTheme } from "@/context/theme-context"
import { useAmbientSound } from "@/hooks/use-ambient-sound"
import { useDiscordPresence } from "@/hooks/use-discord-presence"
import { Confetti, MilestoneCelebration } from "@/components/confetti"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Coffee, Zap, FastForward, Check, SkipForward, Volume2, VolumeX } from "lucide-react"

// Speed multiplier options for faster preview
const SPEED_OPTIONS = [1, 2, 5, 10] as const
type SpeedMultiplier = typeof SPEED_OPTIONS[number]

// Batman focus quotes
const BATMAN_QUOTES = [
  "It's not who I am underneath, but what I do that defines me.",
  "The night is darkest just before the dawn.",
  "Why do we fall? So we can learn to pick ourselves up.",
  "I'm whatever Gotham needs me to be.",
  "Everything's impossible until somebody does it.",
  "Our greatest glory is not in never falling, but in rising every time we fall.",
  "A hero can be anyone.",
  "Endure. In enduring, grow strong.",
  "It's not about what I want, it's about what's fair.",
  "Sometimes the truth isn't good enough.",
]

export function PomodoroTimer({ isMini = false }: { isMini?: boolean }) {
  const {
    settings, addSession, currentPeriod, incrementPeriod, resetPeriod, playSound, activeTaskId, tasks,
    sessions: sessionHistory, // Session history with timestamps
    // Timer state from context
    timerMode: mode, setTimerMode: setMode,
    timeLeft, setTimeLeft,
    isRunning, setIsRunning,
    isOvertime, setIsOvertime,
    overtimeSeconds, setOvertimeSeconds,
    completedSessions: totalSessions, setCompletedSessions: setSessions
  } = usePomodoro()
  const { theme } = useTheme()
  const ambientSound = useAmbientSound(settings.ambientSound, settings.ambientVolume)

  // Use fallback values to prevent NaN
  const safeSettings = {
    focusMinutes: settings.focusMinutes || 25,
    shortBreakMinutes: settings.shortBreakMinutes || 5,
    longBreakMinutes: settings.longBreakMinutes || 15,
    periodsBeforeLongBreak: settings.periodsBeforeLongBreak || 4,
    autoStartBreaks: settings.autoStartBreaks || false,
  }

  // Discord Rich Presence - show timer status in Discord
  useDiscordPresence({
    mode,
    timeLeft,
    isRunning,
    isOvertime,
    overtimeSeconds,
    session: currentPeriod + 1,
    totalSessions: safeSettings.periodsBeforeLongBreak,
    // Custom Discord settings from context
    enabled: settings.discordEnabled ?? true,
    imageUrl: settings.discordImageUrl ?? 'https://i.imgur.com/qLEyaIk.gif',
    focusText: settings.discordFocusText ?? 'Adaptation in Progress 🔄',
    breakText: settings.discordBreakText ?? 'Recovering Energy ✨',
  })

  const TIMER_MODES = {
    focus: { minutes: safeSettings.focusMinutes, label: "Focus Time", icon: Zap },
    shortBreak: { minutes: safeSettings.shortBreakMinutes, label: "Short Break", icon: Coffee },
    longBreak: { minutes: safeSettings.longBreakMinutes, label: "Long Break", icon: Coffee },
  }

  // Calculate today's completed focus sessions
  const todaySessions = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return sessionHistory.filter(s =>
      s.type === 'focus' && new Date(s.completedAt) >= today
    ).length
  }, [sessionHistory])

  // Local UI state (not persisted)
  const [speed, setSpeed] = useState<SpeedMultiplier>(1)
  const [quoteIndex, setQuoteIndex] = useState(0)

  // Ref to prevent multiple notification sounds
  const soundPlayedRef = useRef(false)

  // Celebration animation states
  const [showConfetti, setShowConfetti] = useState(false)
  const [showMilestone, setShowMilestone] = useState(false)
  const [milestoneMessage, setMilestoneMessage] = useState('')

  // Get a random quote when focus mode starts
  const currentQuote = useMemo(() => BATMAN_QUOTES[quoteIndex], [quoteIndex])

  // Get active task
  const activeTask = useMemo(() => tasks.find(t => t.id === activeTaskId), [tasks, activeTaskId])

  const totalSeconds = TIMER_MODES[mode].minutes * 60
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100
  const elapsedSeconds = totalSeconds - timeLeft
  const isLowTime = timeLeft <= 60 && timeLeft > 0

  // Mode-specific colors
  const progressColor = mode === "focus" ? "text-primary" : "text-green-400"
  const glowColor = mode === "focus" ? "bg-primary/10" : "bg-green-400/10"

  const resetTimer = useCallback((newMode: TimerMode) => {
    setMode(newMode)
    setTimeLeft(TIMER_MODES[newMode].minutes * 60)
    setIsRunning(false)
    setIsOvertime(false)
    setOvertimeSeconds(0)
  }, [TIMER_MODES])

  // End session early - save partial time and go to break
  const endSession = useCallback(() => {
    if (mode === "focus" && elapsedSeconds > 0) {
      // Stop ambient sound
      ambientSound.pause()
      // Play themed notification sound
      playSound(theme)

      // Save the actual time worked (not full duration)
      // If in overtime, add the overtime seconds to the duration
      const duration = elapsedSeconds + (isOvertime ? overtimeSeconds : 0)
      const targetDuration = totalSeconds

      // Determine session quality
      let quality: 'complete' | 'extended' | 'interrupted' | 'abandoned'
      if (isOvertime && overtimeSeconds > 0) {
        quality = 'extended' // Went past target time (flow state!)
      } else if (elapsedSeconds >= targetDuration) {
        quality = 'complete' // Reached target exactly
      } else if (duration < 10 * 60) {
        quality = 'abandoned' // Less than 10 minutes
      } else if (elapsedSeconds < targetDuration * 0.5) {
        quality = 'interrupted' // Less than 50% of target
      } else {
        quality = 'complete' // Reached at least 50%
      }

      addSession("focus", duration, quality, targetDuration)
      setSessions((prev) => prev + 1)
      incrementPeriod()

      // Go to appropriate break
      if ((currentPeriod + 1) % safeSettings.periodsBeforeLongBreak === 0) {
        resetTimer("longBreak")
        resetPeriod()
      } else {
        resetTimer("shortBreak")
      }

      // Auto-start break if enabled
      if (safeSettings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 500)
      }
    } else {
      // For breaks, just skip to focus
      resetTimer("focus")
    }
  }, [mode, elapsedSeconds, playSound, addSession, incrementPeriod, currentPeriod, safeSettings.periodsBeforeLongBreak, safeSettings.autoStartBreaks, resetTimer, resetPeriod])

  const toggleTimer = useCallback(() => {
    if (!isRunning && mode === "focus") {
      // Pick a new random quote when starting focus
      setQuoteIndex(Math.floor(Math.random() * BATMAN_QUOTES.length))
      // Start ambient sound when focus begins
      if (settings.ambientSound !== 'none') {
        ambientSound.play()
      }
    } else if (isRunning && mode === "focus") {
      // Pause ambient sound when pausing focus
      ambientSound.pause()
    }
    setIsRunning(prev => !prev)
  }, [isRunning, mode, settings.ambientSound, ambientSound])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.code === "Space") {
        e.preventDefault()
        toggleTimer()
      } else if (e.code === "KeyR" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        resetTimer(mode)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleTimer, resetTimer, mode])

  // Update time when settings or mode change (only when not running and time is at full)
  useEffect(() => {
    // Only reset if timer hasn't started yet (timeLeft equals full duration)
    const fullDuration = TIMER_MODES[mode].minutes * 60
    if (!isRunning && timeLeft === fullDuration) {
      setTimeLeft(fullDuration)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, mode])


  // Timer completion handler - watches for when timer reaches zero
  // The actual countdown runs in the context (persists across navigation)
  useEffect(() => {
    // Only trigger when timer JUST finished (timeLeft is 0 and isOvertime just became true)
    // Use ref to prevent playing sound multiple times
    if (timeLeft === 0 && isOvertime && isRunning && !soundPlayedRef.current) {
      // Mark sound as played to prevent repeats
      soundPlayedRef.current = true

      // Play themed sound
      playSound(theme)

      // 🎉 Trigger celebration animations for focus sessions
      if (mode === "focus") {
        setShowConfetti(true)
        setMilestoneMessage("Session Complete! 🦇")
        setShowMilestone(true)
      }

      // Stop ambient sound when focus ends
      if (mode === "focus") {
        ambientSound.pause()
      }

      // Desktop notification (Tauri native)
      import('@tauri-apps/plugin-notification').then(async ({ sendNotification, isPermissionGranted, requestPermission }) => {
        try {
          let permissionGranted = await isPermissionGranted()
          if (!permissionGranted) {
            const permission = await requestPermission()
            permissionGranted = permission === 'granted'
          }
          if (permissionGranted) {
            sendNotification({
              title: 'Bat Pomodoro',
              body: mode === 'focus' ? 'Focus session target reached! Continuing in overtime...' : 'Break is over! Time to focus.',
            })
          }
        } catch (e) {
          // Fallback to browser notification if Tauri not available
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Bat Pomodoro', {
              body: mode === 'focus' ? 'Focus session target reached!' : 'Break is over!',
              icon: '/favicon.ico'
            })
          }
        }
      }).catch(() => {
        // Browser fallback
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Bat Pomodoro', {
            body: mode === 'focus' ? 'Focus session target reached!' : 'Break is over!',
            icon: '/favicon.ico'
          })
        }
      })

      // Bring window to front
      import('@tauri-apps/api/window').then(async ({ getCurrentWindow }) => {
        const win = getCurrentWindow()
        try {
          await win.show()
          await win.unminimize()
          await win.setFocus()
          await win.requestUserAttention(2)
          console.log('🪟 Window brought to front!')
        } catch (e) {
          console.log('Window operation failed:', e)
        }
      }).catch((e) => { })

      // For breaks: stop and reset to focus
      if (mode !== "focus") {
        setIsRunning(false)
        resetTimer("focus")
        if (safeSettings.autoStartBreaks) {
          setTimeout(() => setIsRunning(true), 500)
        }
      }
      // For focus mode: stays in overtime, session recorded when user validates
    }

    // Reset the sound played flag when starting a new session
    if (timeLeft > 0 && !isOvertime) {
      soundPlayedRef.current = false
    }
  }, [timeLeft, isOvertime, isRunning, mode, playSound, resetTimer, safeSettings.autoStartBreaks])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const circumference = 2 * Math.PI * 140
  const strokeDashoffset = circumference - (progress / 100) * circumference

  if (isMini) {
    const miniRadius = 50
    const miniCircumference = 2 * Math.PI * miniRadius
    const miniDashOffset = miniCircumference - (progress / 100) * miniCircumference

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          <svg className="h-32 w-32 -rotate-90 transform text-primary" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={miniRadius} stroke="currentColor" strokeWidth="4" fill="none" className="text-secondary" />
            <circle
              cx="60" cy="60" r={miniRadius}
              stroke="currentColor" strokeWidth="4" fill="none"
              strokeDasharray={miniCircumference} strokeDashoffset={miniDashOffset}
              strokeLinecap="round"
              className={`${progressColor} transition-all duration-1000 ease-linear`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-mono text-2xl font-bold ${progressColor} ${isOvertime ? 'animate-pulse' : ''}`}>
              {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="ghost" size="icon" onClick={() => resetTimer(mode)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            size="icon" onClick={toggleTimer}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Timer Mode Selector */}
      <div className="flex gap-2 rounded-full bg-secondary p-1">
        {(Object.keys(TIMER_MODES) as TimerMode[]).map((timerMode) => {
          const ModeIcon = TIMER_MODES[timerMode].icon
          return (
            <button
              key={timerMode}
              onClick={() => resetTimer(timerMode)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${mode === timerMode
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <ModeIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{TIMER_MODES[timerMode].label}</span>
            </button>
          )
        })}
      </div>

      {/* Period indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: settings.periodsBeforeLongBreak }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${i < currentPeriod ? "bg-primary" : "bg-secondary"
              }`}
          />
        ))}
      </div>

      {/* Circular Timer */}
      <div className="relative flex items-center justify-center">
        {/* Background glow effect with dynamic color */}
        <div className={`absolute inset-0 rounded-full blur-3xl transition-colors duration-500 ${glowColor}`} />

        <svg className={`h-64 w-64 -rotate-90 sm:h-72 sm:w-72 transition-transform duration-500 ${isLowTime && isRunning ? "animate-pulse fill-primary/5" : ""}`} viewBox="0 0 320 320">
          {/* Background circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${progressColor} transition-all duration-1000 ease-linear`}
          />
          {/* Inner decorative ring */}
          <circle cx="160" cy="160" r="120" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
        </svg>

        {/* Time display */}
        <div className="absolute flex flex-col items-center">
          <span className={`font-mono text-6xl font-bold tracking-tight sm:text-7xl ${progressColor} ${isOvertime ? 'animate-pulse' : ''}`}>
            {isOvertime ?
              `+${String(Math.floor(overtimeSeconds / 60)).padStart(2, "0")}:${String(overtimeSeconds % 60).padStart(2, "0")}`
              :
              `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
            }
          </span>
          {isOvertime && <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Overtime</span>}
          <span className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">
            {TIMER_MODES[mode].label}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => resetTimer(mode)}
          className="h-12 w-12 rounded-full border-border hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw className="h-5 w-5" />
          <span className="sr-only">Reset timer</span>
        </Button>

        {/* Show different controls when paused with elapsed time */}
        {!isRunning && elapsedSeconds > 0 && mode === "focus" ? (
          <>
            {/* Resume Button */}
            <Button
              size="lg"
              onClick={toggleTimer}
              className="h-16 w-28 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Play className="mr-2 h-6 w-6" />
              Resume
            </Button>

            {/* Validate Button */}
            <Button
              size="lg"
              onClick={endSession}
              className="h-16 rounded-full bg-green-600 text-white hover:bg-green-500 px-6"
            >
              <Check className="mr-2 h-6 w-6" />
              Validate ({Math.floor(elapsedSeconds / 60)}m)
            </Button>
          </>
        ) : isOvertime && mode === "focus" ? (
          <>
            {/* Overtime Controls - Show Pause and Validate */}
            <Button
              size="lg"
              onClick={toggleTimer}
              className="h-16 w-28 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-6 w-6" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-6 w-6" />
                  Resume
                </>
              )}
            </Button>

            {/* Validate Button - prominent in overtime */}
            <Button
              size="lg"
              onClick={endSession}
              className="h-16 rounded-full bg-green-600 text-white hover:bg-green-500 px-6 animate-pulse"
            >
              <Check className="mr-2 h-6 w-6" />
              Validate ({Math.floor((TIMER_MODES[mode].minutes * 60 + overtimeSeconds) / 60)}m)
            </Button>
          </>
        ) : (
          <>
            <Button
              size="lg"
              onClick={toggleTimer}
              className="h-16 w-32 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-6 w-6" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-6 w-6" />
                  Start
                </>
              )}
            </Button>

            <div className="flex flex-col h-12 items-center justify-center rounded-full border border-border bg-card px-3">
              <span className="text-lg font-bold text-primary leading-none">{todaySessions}</span>
              <span className="text-[9px] text-muted-foreground leading-none">today</span>
            </div>
          </>
        )}
        {/* End Session Button - appears when paused with elapsed time */}
        {!isRunning && elapsedSeconds > 0 && mode === "focus" && !isOvertime && (
          <Button
            variant="outline"
            onClick={endSession}
            className="gap-2 border-green-500/50 text-green-400 hover:bg-green-500/20"
          >
            <Check className="h-4 w-4" />
            End Session ({Math.floor(elapsedSeconds / 60)}m worked) → Break
          </Button>
        )}

        {/* Skip Break Button - only during breaks */}
        {mode !== "focus" && (
          <Button
            variant="outline"
            onClick={() => {
              resetTimer("focus")
              if (safeSettings.autoStartBreaks) setIsRunning(true)
            }}
            className="gap-2 border-primary/50 text-primary hover:bg-primary/20"
          >
            <SkipForward className="h-4 w-4" />
            Skip Break
          </Button>
        )}
      </div>

      {/* Speed Control - Subtle secondary control */}
      <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <FastForward className="h-3 w-3 text-muted-foreground" />
        <div className="flex gap-0.5 rounded-full bg-secondary/50 p-0.5">
          {SPEED_OPTIONS.map((speedOption) => (
            <button
              key={speedOption}
              onClick={() => setSpeed(speedOption)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${speed === speedOption
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {speedOption}x
            </button>
          ))}
        </div>
        {speed > 1 && (
          <span className="text-[10px] text-accent">
            ⚡
          </span>
        )}
      </div>

      {/* Focus Quote or Active Task */}
      {mode === "focus" && (activeTask || isRunning) && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-1000 text-center">
          {activeTask ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Current Objective</span>
              <p className="max-w-xs text-sm font-medium text-foreground truncate">
                {activeTask.text}
              </p>
            </div>
          ) : (
            <p className="max-w-xs text-xs italic text-muted-foreground">
              "{currentQuote}"
            </p>
          )}
        </div>
      )}

      {/* 🎉 Celebration Animations */}
      <Confetti
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
      <MilestoneCelebration
        isActive={showMilestone}
        message={milestoneMessage}
        emoji="🦇"
        onComplete={() => setShowMilestone(false)}
      />
    </div>
  )
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}
