// Audio configuration for Bat Pomodoro
// Defines ambient sounds and themed notification sounds

import { Theme } from "@/context/theme-context"

export type AmbientSoundType = 'none' | 'rain' | 'forest' | 'coffee' | 'whitenoise'

export interface AmbientSoundConfig {
    id: AmbientSoundType
    name: string
    icon: string
    file: string | null
}

export const AMBIENT_SOUNDS: AmbientSoundConfig[] = [
    { id: 'none', name: 'None', icon: '🔇', file: null },
    { id: 'rain', name: 'Rain', icon: '🌧️', file: '/sounds/ambient/rain.mp3' },
    { id: 'forest', name: 'Forest', icon: '🌲', file: '/sounds/ambient/forest.mp3' },
    { id: 'coffee', name: 'Coffee Shop', icon: '☕', file: '/sounds/ambient/coffee-shop.mp3' },
    { id: 'whitenoise', name: 'White Noise', icon: '📻', file: '/sounds/ambient/white-noise.mp3' },
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
