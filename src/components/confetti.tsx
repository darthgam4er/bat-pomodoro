"use client"

import { useEffect, useState, useCallback } from 'react'

interface Particle {
    id: number
    x: number
    y: number
    rotation: number
    color: string
    scale: number
    velocity: { x: number; y: number }
}

const COLORS = [
    '#FFD700', // Gold
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#A855F7', // Purple (primary)
    '#F97316', // Orange
    '#22C55E', // Green
    '#3B82F6', // Blue
]

interface ConfettiProps {
    isActive: boolean
    onComplete?: () => void
    particleCount?: number
    duration?: number
}

export function Confetti({
    isActive,
    onComplete,
    particleCount = 50,
    duration = 3000
}: ConfettiProps) {
    const [particles, setParticles] = useState<Particle[]>([])

    const createParticles = useCallback(() => {
        const newParticles: Particle[] = []
        for (let i = 0; i < particleCount; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * 100,
                y: -10 - Math.random() * 20,
                rotation: Math.random() * 360,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                scale: 0.5 + Math.random() * 0.5,
                velocity: {
                    x: (Math.random() - 0.5) * 3,
                    y: 2 + Math.random() * 3,
                },
            })
        }
        return newParticles
    }, [particleCount])

    useEffect(() => {
        if (!isActive) {
            setParticles([])
            return
        }

        // Create initial particles
        setParticles(createParticles())

        // Animation loop
        const interval = setInterval(() => {
            setParticles(prev =>
                prev.map(p => ({
                    ...p,
                    x: p.x + p.velocity.x,
                    y: p.y + p.velocity.y,
                    rotation: p.rotation + 5,
                    velocity: {
                        ...p.velocity,
                        y: p.velocity.y + 0.1, // Gravity
                    },
                })).filter(p => p.y < 120) // Remove particles that fell off screen
            )
        }, 16)

        // Cleanup after duration
        const timeout = setTimeout(() => {
            clearInterval(interval)
            setParticles([])
            onComplete?.()
        }, duration)

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [isActive, createParticles, duration, onComplete])

    if (!isActive || particles.length === 0) return null

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute h-3 w-3"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
                        backgroundColor: particle.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    }}
                />
            ))}
        </div>
    )
}

// Level up animation component
export function LevelUpAnimation({
    isActive,
    level,
    onComplete
}: {
    isActive: boolean
    level: number
    onComplete?: () => void
}) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (isActive) {
            setVisible(true)
            const timer = setTimeout(() => {
                setVisible(false)
                onComplete?.()
            }, 2500)
            return () => clearTimeout(timer)
        }
    }, [isActive, onComplete])

    if (!visible) return null

    return (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
            <div className="animate-bounce text-center">
                <div className="mb-2 text-6xl">🦇</div>
                <div className="text-2xl font-bold text-primary animate-pulse">
                    LEVEL UP!
                </div>
                <div className="text-4xl font-bold text-foreground">
                    Level {level}
                </div>
            </div>
        </div>
    )
}

// Milestone celebration component
export function MilestoneCelebration({
    isActive,
    message,
    emoji = '🎉',
    onComplete,
}: {
    isActive: boolean
    message: string
    emoji?: string
    onComplete?: () => void
}) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (isActive) {
            setVisible(true)
            const timer = setTimeout(() => {
                setVisible(false)
                onComplete?.()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [isActive, onComplete])

    if (!visible) return null

    return (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="rounded-xl bg-gradient-to-r from-primary/90 to-purple-600/90 px-8 py-4 text-center shadow-2xl"
                style={{
                    animation: 'celebrationPop 0.5s ease-out',
                }}
            >
                <div className="text-4xl mb-2">{emoji}</div>
                <div className="text-xl font-bold text-white">{message}</div>
            </div>
            <style jsx global>{`
        @keyframes celebrationPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    )
}
