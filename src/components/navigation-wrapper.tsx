"use client"

import { usePomodoro } from "@/context/pomodoro-context"
import { Navigation } from "@/components/navigation"

export function NavigationWrapper() {
    const { isMiniMode } = usePomodoro()

    if (isMiniMode) return null
    return <Navigation />
}
