"use client"

import { useMemo, useEffect, useState } from "react"
import Image from "next/image"
import { TimerMode } from "@/context/pomodoro-context"

interface MahoragaSpriteProps {
    mode: TimerMode
    isRunning: boolean
    isOvertime: boolean
    isCelebrating?: boolean
    size?: "sm" | "md" | "lg"
}

const SPRITE_MAP = {
    idle: "/mahoraga-idle.png",
    focus: "/mahoraga-focus.png",
    shortBreak: "/mahoraga-break.png",
    longBreak: "/mahoraga-break.png",
    celebrate: "/mahoraga-celebrate.png",
}

const SIZE_MAP = {
    sm: { width: 80, height: 80 },
    md: { width: 120, height: 120 },
    lg: { width: 180, height: 180 },
}

export function MahoragaSprite({
    mode,
    isRunning,
    isOvertime,
    isCelebrating = false,
    size = "md",
}: MahoragaSpriteProps) {
    // Animation state for frame cycling
    const [animFrame, setAnimFrame] = useState(0)

    // Cycle animation frames for breathing/bobbing effect
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimFrame(prev => (prev + 1) % 60) // 60 frames cycle
        }, 50) // 20 FPS
        return () => clearInterval(interval)
    }, [])

    // Determine which sprite to show
    const currentSprite = useMemo(() => {
        if (isCelebrating) return SPRITE_MAP.celebrate
        if (!isRunning && mode === "focus") return SPRITE_MAP.idle
        if (mode === "focus") return SPRITE_MAP.focus
        return SPRITE_MAP[mode] || SPRITE_MAP.idle
    }, [mode, isRunning, isCelebrating])

    const dimensions = SIZE_MAP[size]

    // Calculate animation transforms based on mode and frame
    const getAnimationStyle = () => {
        const breathingOffset = Math.sin(animFrame * 0.15) * 3
        const bobOffset = Math.sin(animFrame * 0.1) * 4
        const scaleX = 1 + Math.sin(animFrame * 0.12) * 0.02
        const scaleY = 1 - Math.sin(animFrame * 0.12) * 0.02

        if (isCelebrating) {
            // Celebration: Big bouncy jump
            const jumpHeight = Math.abs(Math.sin(animFrame * 0.3)) * 20
            const squash = 1 + Math.sin(animFrame * 0.3) * 0.1
            return {
                transform: `translateY(-${jumpHeight}px) scaleX(${squash}) scaleY(${2 - squash})`,
                transition: 'transform 0.05s ease-out',
            }
        }

        if (isRunning && mode === "focus") {
            // Focus mode: Determined stance with slight shake/pulse
            const shakeX = Math.sin(animFrame * 0.5) * 1
            const pulse = 1 + Math.sin(animFrame * 0.2) * 0.03
            return {
                transform: `translateX(${shakeX}px) translateY(${breathingOffset}px) scale(${pulse})`,
                filter: 'sepia(10%) contrast(1.1) brightness(1.05)',
            }
        }

        if (isOvertime) {
            // Overtime: Intense vibration
            const shakeX = Math.sin(animFrame * 1.5) * 3
            const shakeY = Math.cos(animFrame * 1.5) * 2
            return {
                transform: `translate(${shakeX}px, ${shakeY}px)`,
                filter: 'sepia(5%) hue-rotate(-10deg) brightness(1.1)',
            }
        }

        if (mode === "shortBreak" || mode === "longBreak") {
            // Break mode: Relaxed breathing
            const relaxedBob = Math.sin(animFrame * 0.08) * 5
            return {
                transform: `translateY(${relaxedBob}px) scaleX(${scaleX}) scaleY(${scaleY})`,
                filter: 'sepia(20%) brightness(0.95)',
            }
        }

        // Idle: Classic rubber hose bounce
        return {
            transform: `translateY(${bobOffset}px) scaleX(${scaleX}) scaleY(${scaleY})`,
            filter: 'sepia(15%) contrast(1.05)',
        }
    }

    return (
        <div className="relative">
            {/* Shadow that moves with character */}
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/20 rounded-full blur-md"
                style={{
                    width: dimensions.width * 0.7,
                    height: 15,
                    transform: `translateX(-50%) scaleX(${1 + Math.sin(animFrame * 0.1) * 0.1})`,
                }}
            />

            {/* Character sprite with animations */}
            <div
                className="relative"
                style={getAnimationStyle()}
            >
                {/* Film grain overlay for vintage effect */}
                <div
                    className="absolute inset-0 pointer-events-none rounded-lg mix-blend-overlay"
                    style={{
                        opacity: 0.1 + Math.sin(animFrame * 0.5) * 0.05,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Main character image */}
                <Image
                    src={currentSprite}
                    alt="Mahoraga"
                    width={dimensions.width}
                    height={dimensions.height}
                    className="drop-shadow-lg"
                    priority
                />

                {/* Overtime glow ring */}
                {isOvertime && (
                    <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                            boxShadow: `0 0 ${20 + Math.sin(animFrame * 0.3) * 10}px ${5 + Math.sin(animFrame * 0.3) * 5}px rgba(168, 85, 247, 0.5)`,
                        }}
                    />
                )}

                {/* Focus mode energy particles */}
                {isRunning && mode === "focus" && (
                    <>
                        <div
                            className="absolute w-2 h-2 bg-primary rounded-full"
                            style={{
                                top: `${20 + Math.sin(animFrame * 0.2) * 30}%`,
                                right: `${-10 + Math.sin(animFrame * 0.15) * 5}%`,
                                opacity: 0.5 + Math.sin(animFrame * 0.3) * 0.5,
                            }}
                        />
                        <div
                            className="absolute w-1.5 h-1.5 bg-primary rounded-full"
                            style={{
                                top: `${50 + Math.cos(animFrame * 0.25) * 20}%`,
                                left: `${-5 + Math.cos(animFrame * 0.2) * 5}%`,
                                opacity: 0.3 + Math.cos(animFrame * 0.25) * 0.5,
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
