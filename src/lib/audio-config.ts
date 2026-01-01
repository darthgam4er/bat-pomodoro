// Audio configuration for Bat Pomodoro
// Defines ambient sounds and themed notification sounds

import { Theme } from "@/context/theme-context"

// Sound types - now includes scientifically-backed focus audio
export type AmbientSoundType = 'none' | 'binaural40hz' | 'pinknoise' | 'brownnoise' | 'whitenoise' | 'nsdr10' | 'nsdr20'

export interface AmbientSoundConfig {
    id: AmbientSoundType
    name: string
    icon: string
    file: string | null
    // For programmatically generated sounds
    generator?: 'binaural' | 'pinknoise' | 'brownnoise' | 'whitenoise'
    description?: string
}

export const AMBIENT_SOUNDS: AmbientSoundConfig[] = [
    {
        id: 'none',
        name: 'None',
        icon: '🔇',
        file: null
    },
    {
        id: 'binaural40hz',
        name: '40 Hz Binaural',
        icon: '🧠',
        file: null,
        generator: 'binaural',
        description: 'Gamma waves for enhanced focus and cognition'
    },
    {
        id: 'pinknoise',
        name: 'Pink Noise',
        icon: '🌸',
        file: '/sounds/ambient/pink-noise.mp3',
        description: 'Balanced frequency spectrum for relaxation'
    },
    {
        id: 'whitenoise',
        name: 'White Noise',
        icon: '📻',
        file: null,
        generator: 'whitenoise',
        description: 'Full frequency noise for masking distractions'
    },
    {
        id: 'brownnoise',
        name: 'Brown Noise',
        icon: '🎵',
        file: '/sounds/ambient/brown-noise.mp3',
        description: 'Deep bass noise for relaxation and sleep'
    },
    {
        id: 'nsdr10',
        name: 'NSDR 10min',
        icon: '🧘',
        file: '/sounds/ambient/nsdr-10min.mp3',
        description: 'Andrew Huberman Non-Sleep Deep Rest (10 minutes)'
    },
    {
        id: 'nsdr20',
        name: 'NSDR 20min',
        icon: '🧘‍♂️',
        file: '/sounds/ambient/nsdr-20min.mp3',
        description: 'Andrew Huberman Non-Sleep Deep Rest (20 minutes)'
    },
]

export interface NotificationSoundConfig {
    theme: Theme
    name: string
    file: string
    // WebAudio fallback frequencies for when files don't exist
    frequencies: number[]
}

export const NOTIFICATION_SOUNDS: Record<Theme, NotificationSoundConfig> = {
    batman: {
        theme: 'batman',
        name: 'Dark Knight Alert',
        file: '/sounds/notifications/batman-complete.mp3',
        frequencies: [220, 293, 349], // A3, D4, F4 - dark, dramatic
    },
    joker: {
        theme: 'joker',
        name: 'Chaos Chime',
        file: '/sounds/notifications/joker-complete.mp3',
        frequencies: [523, 392, 659], // C5, G4, E5 - chaotic, playful
    },
    robin: {
        theme: 'robin',
        name: 'Boy Wonder Beep',
        file: '/sounds/notifications/robin-complete.mp3',
        frequencies: [440, 554, 659], // A4, C#5, E5 - bright, energetic
    },
}

// Default volumes
export const DEFAULT_AMBIENT_VOLUME = 50
export const DEFAULT_NOTIFICATION_VOLUME = 70
