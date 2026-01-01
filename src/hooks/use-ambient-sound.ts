"use client"

import { useState, useEffect, useCallback } from 'react'
import { AmbientSoundType } from '@/lib/audio-config'
import { getAmbientAudioManager } from '@/lib/audio-manager'

interface UseAmbientSoundReturn {
    currentSound: AmbientSoundType
    isPlaying: boolean
    volume: number
    setSound: (sound: AmbientSoundType) => void
    setVolume: (volume: number) => void
    play: () => void
    pause: () => void
    toggle: () => void
}

export function useAmbientSound(
    initialSound: AmbientSoundType = 'none',
    initialVolume: number = 50
): UseAmbientSoundReturn {
    const manager = getAmbientAudioManager()

    const [state, setState] = useState(() => manager.getState())

    // Subscribe to manager state changes
    useEffect(() => {
        const updateState = () => {
            setState(manager.getState())
        }
        manager.setOnStateChange(updateState)

        // Sync initial settings if not already set
        const currentState = manager.getState()
        if (currentState.currentSound === 'none' && initialSound !== 'none') {
            manager.setSound(initialSound)
        }
        if (currentState.volume !== initialVolume) {
            manager.setVolume(initialVolume)
        }

        return () => {
            // Don't cleanup - let it persist!
        }
    }, [])

    const play = useCallback(() => {
        manager.play()
    }, [manager])

    const pause = useCallback(() => {
        manager.stop()
    }, [manager])

    const toggle = useCallback(() => {
        manager.toggle()
    }, [manager])

    const setSound = useCallback((sound: AmbientSoundType) => {
        manager.setSound(sound)
    }, [manager])

    const setVolume = useCallback((vol: number) => {
        manager.setVolume(vol)
    }, [manager])

    return {
        currentSound: state.currentSound,
        isPlaying: state.isPlaying,
        volume: state.volume,
        setSound,
        setVolume,
        play,
        pause,
        toggle,
    }
}
