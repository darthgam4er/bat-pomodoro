"use client"

import { useEffect } from "react"
import { BatmanLogo } from "@/components/batman-logo"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { TaskList } from "@/components/task-list"
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
        // Switch to Mini
        await appWindow.setSize(new LogicalSize(300, 150))
        await appWindow.setAlwaysOnTop(true)
        setMiniMode(true)
      } else {
        // Switch to Normal
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
        {/* Background Pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        {/* Controls */}
        <div className="absolute top-2 right-2 z-50 flex gap-2">
          <button
            onClick={toggleMiniMode}
            className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Expand"
            aria-label="Expand window"
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

  // Normal UI
  return (
    <main className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 pb-20">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      {/* Gotham skyline silhouette effect */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Window Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={toggleMiniMode}
          className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          title="Mini Mode"
          aria-label="Toggle mini mode"
        >
          <MoveDiagonal className="h-5 w-5" />
        </button>
        <button
          onClick={minimizeWindow}
          className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          title="Minimize"
          aria-label="Minimize window"
        >
          <Minus className="h-5 w-5" />
        </button>
      </div>

      {/* Header */}
      <header className="relative z-10 mb-6 flex flex-col items-center gap-2">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl">
            <BatmanLogo className="h-12 w-auto text-primary/50" />
          </div>
          <BatmanLogo className="relative h-12 w-auto text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bat Pomodoro</h1>
          <p className="mt-1 text-sm text-muted-foreground">Focus like the Dark Knight. Master your time.</p>
        </div>
      </header>

      {/* Timer */}
      <section className="relative z-10 w-full flex justify-center">
        <PomodoroTimer />
      </section>

      {/* Task List */}
      <section className="relative z-10 mt-8 w-full flex justify-center pb-8">
        <TaskList />
      </section>

      {/* Footer - hide to avoid overlap */}
    </main>
  )
}

