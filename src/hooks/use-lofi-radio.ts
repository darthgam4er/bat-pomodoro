"use client"

import { useState, useRef, useCallback, useEffect } from 'react'

// Free HTTPS radio streams - tested to work in browsers
export const LOFI_STATIONS = [
    {
        id: 'none',
        name: 'None',
        url: '',
        description: 'No music'
    },
    {
        id: 'wrti-classical',
        name: 'WRTI Classical',
        url: 'https://wrti-live.streamguys1.com/classical-mp3',
        description: 'Classical music from Philadelphia'
    },
    {
        id: 'wrti-jazz',
        name: 'WRTI Jazz',
        url: 'https://wrti-live.streamguys1.com/jazz-mp3',
        description: 'Jazz from Philadelphia'
    },
    {
        id: 'kusc-classical',
        name: 'Classical KUSC',
        url: 'https://25043.live.streamtheworld.com/KUSCMP256.mp3',
        description: 'Classical from Los Angeles'
    }
] as const

export type LofiStationId = typeof LOFI_STATIONS[number]['id']

interface UseLofiRadioReturn {
    currentStation: LofiStationId
    setStation: (id: LofiStationId) => void
    isPlaying: boolean
    play: () => void
    pause: () => void
    toggle: () => void
    volume: number
    setVolume: (vol: number) => void
    isLoading: boolean
    error: string | null
}

export function useLofiRadio(
    initialStation: LofiStationId = 'none',
    initialVolume: number = 50
): UseLofiRadioReturn {
    const [currentStation, setCurrentStation] = useState<LofiStationId>(initialStation)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolumeState] = useState(initialVolume)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Get station URL
    const getStationUrl = useCallback((id: LofiStationId): string => {
        const station = LOFI_STATIONS.find(s => s.id === id)
        return station?.url || ''
    }, [])

    // Create audio element once and keep reference stable
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio()
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    // Update audio source when station changes
    useEffect(() => {
        const url = getStationUrl(currentStation)

        if (!audioRef.current) return

        if (!url || currentStation === 'none') {
            audioRef.current.pause()
            audioRef.current.src = ''
            setIsPlaying(false)
            return
        }

        // Only update src if it changed
        if (audioRef.current.src !== url) {
            audioRef.current.src = url
        }
    }, [currentStation, getStationUrl])

    // Apply volume changes immediately to audio element
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume / 100))
            console.log('Volume set to:', volume / 100)
        }
    }, [volume])

    // Set up event listeners once
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handlePlay = () => {
            setIsPlaying(true)
            setIsLoading(false)
            setError(null)
        }
        const handlePause = () => setIsPlaying(false)
        const handleError = (e: Event) => {
            console.error('Audio error:', e, audio.error)
            setError('Stream error')
            setIsLoading(false)
            setIsPlaying(false)
        }
        const handleWaiting = () => setIsLoading(true)
        const handleCanPlay = () => setIsLoading(false)

        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)
        audio.addEventListener('error', handleError)
        audio.addEventListener('waiting', handleWaiting)
        audio.addEventListener('canplay', handleCanPlay)

        return () => {
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
            audio.removeEventListener('error', handleError)
            audio.removeEventListener('waiting', handleWaiting)
            audio.removeEventListener('canplay', handleCanPlay)
        }
    }, [])

    const play = useCallback(() => {
        if (audioRef.current && currentStation !== 'none') {
            setError(null)
            setIsLoading(true)
            audioRef.current.play().catch((err) => {
                console.error('Failed to play:', err)
                setError('Failed to play')
                setIsLoading(false)
            })
        }
    }, [currentStation])

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
        }
    }, [])

    const toggle = useCallback(() => {
        if (isPlaying) {
            pause()
        } else {
            play()
        }
    }, [isPlaying, play, pause])

    const setStation = useCallback((id: LofiStationId) => {
        if (audioRef.current) {
            audioRef.current.pause()
        }
        setError(null)
        setCurrentStation(id)
    }, [])

    const setVolume = useCallback((vol: number) => {
        const clampedVol = Math.max(0, Math.min(100, vol))
        setVolumeState(clampedVol)
        // Also apply immediately to audio element for real-time feedback
        if (audioRef.current) {
            audioRef.current.volume = clampedVol / 100
        }
    }, [])

    return {
        currentStation,
        setStation,
        isPlaying,
        play,
        pause,
        toggle,
        volume,
        setVolume,
        isLoading,
        error
    }
}
