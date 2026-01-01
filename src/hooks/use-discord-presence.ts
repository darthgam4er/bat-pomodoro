"use client"

import { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'

interface DiscordPresenceProps {
    mode: string
    timeLeft: number
    isRunning: boolean
    isOvertime: boolean
    overtimeSeconds: number
    session: number
    totalSessions: number
    // Custom settings
    enabled: boolean
    imageUrl: string
    focusText: string
    breakText: string
}

export function useDiscordPresence({
    mode,
    timeLeft,
    isRunning,
    isOvertime,
    overtimeSeconds,
    session,
    totalSessions,
    enabled,
    imageUrl,
    focusText,
    breakText,
}: DiscordPresenceProps) {
    const lastUpdateRef = useRef<number>(0)
    const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Skip if Discord is disabled
        if (!enabled) {
            invoke('clear_discord_status').catch(() => { })
            return
        }

        // Only update Discord every 5 seconds to avoid rate limits
        const UPDATE_INTERVAL = 5000

        const updateDiscord = async () => {
            const now = Date.now()
            if (now - lastUpdateRef.current < UPDATE_INTERVAL) return
            lastUpdateRef.current = now

            try {
                if (isRunning) {
                    await invoke('update_discord_status', {
                        mode,
                        timeLeft,
                        isOvertime,
                        overtimeSeconds,
                        session,
                        totalSessions,
                        imageUrl,
                        focusText,
                        breakText,
                    })
                } else {
                    // When paused/stopped, clear the status
                    await invoke('clear_discord_status')
                }
            } catch (e) {
                // Tauri command not available (likely running in browser)
                console.log('Discord presence not available:', e)
            }
        }

        // Update immediately when state changes
        updateDiscord()

        // Set up periodic updates (Discord needs regular updates)
        if (isRunning) {
            updateIntervalRef.current = setInterval(updateDiscord, UPDATE_INTERVAL)
        }

        return () => {
            if (updateIntervalRef.current) {
                clearInterval(updateIntervalRef.current)
            }
        }
    }, [mode, timeLeft, isRunning, isOvertime, overtimeSeconds, session, totalSessions, enabled, imageUrl, focusText, breakText])

    // Clear Discord status on unmount
    useEffect(() => {
        return () => {
            invoke('clear_discord_status').catch(() => { })
        }
    }, [])
}
