"use client"

import { BatmanLogo } from "@/components/batman-logo"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { Minus, MoveDiagonal, Maximize2 } from "lucide-react"
import { usePomodoro } from "@/context/pomodoro-context"

export default function HomePage() {
  const { isMiniMode, setMiniMode } = usePomodoro()

  const minimizeWindow = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().minimize()
    } catch (e) {
      console.error("Failed to minimize", e)
    }
  }

  const toggleMiniMode = async () => {
    try {
      const { getCurrentWindow, LogicalSize } = await import('@tauri-apps/api/window')
      const appWindow = getCurrentWindow()

      if (!isMiniMode) {
        await appWindow.setSize(new LogicalSize(300, 150))
        await appWindow.setAlwaysOnTop(true)
        setMiniMode(true)
      } else {
        await appWindow.setSize(new LogicalSize(420, 700))
        await appWindow.setAlwaysOnTop(false)
        setMiniMode(false)
      }
    } catch (e) {
      console.error("Failed to toggle mini mode", e)
    }
  }

  // Mini Mode UI
  if (isMiniMode) {
    return (
      <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-2 right-2 z-50 flex gap-2">
          <button
            onClick={toggleMiniMode}
            className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Expand"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        <div className="scale-75 origin-center mt-4">
          <PomodoroTimer isMini={true} />
        </div>
      </main>
    )
  }

  // Normal UI - Optimized for Desktop App (420x700)
  return (
    <main className="relative flex h-screen flex-col items-center overflow-hidden bg-background px-4 pt-12 pb-24">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Bottom fade for navigation */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Window Controls - Compact */}
      <div className="absolute top-3 right-3 z-50 flex gap-1">
        <button
          onClick={toggleMiniMode}
          className="rounded-lg p-2 bg-white/5 border border-white/10 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all duration-200"
          title="Mini Mode"
        >
          <MoveDiagonal className="h-4 w-4" />
        </button>
        <button
          onClick={minimizeWindow}
          className="rounded-lg p-2 bg-white/5 border border-white/10 text-muted-foreground hover:bg-yellow-500/20 hover:text-yellow-400 transition-all duration-200"
          title="Minimize"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* Compact Header */}
      <header className="relative z-10 flex flex-col items-center gap-1 mb-4">
        <div className="flex items-center gap-2">
          <BatmanLogo className="h-8 w-auto text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Bat Pomodoro
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Focus like the Dark Knight
        </p>
      </header>

      {/* Timer - Main Focus Area */}
      <section className="relative z-10 w-full max-w-sm flex-1 flex items-center justify-center">
        <div className="w-full rounded-2xl backdrop-blur-md bg-card/30 border border-white/10 p-4 shadow-xl">
          <PomodoroTimer />
        </div>
      </section>
    </main>
  )
}
