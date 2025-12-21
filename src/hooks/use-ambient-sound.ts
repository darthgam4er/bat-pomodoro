"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { AmbientSoundType } from '@/lib/audio-config'

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

// Create noise buffer for WebAudio
function createNoiseBuffer(audioContext: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBuffer {
    const bufferSize = audioContext.sampleRate * 2 // 2 seconds of audio
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    if (type === 'white') {
        // White noise - random values
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1
        }
    } else if (type === 'pink') {
        // Pink noise - using Paul Kellet's algorithm
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1
            b0 = 0.99886 * b0 + white * 0.0555179
            b1 = 0.99332 * b1 + white * 0.0750759
            b2 = 0.96900 * b2 + white * 0.1538520
            b3 = 0.86650 * b3 + white * 0.3104856
            b4 = 0.55000 * b4 + white * 0.5329522
            b5 = -0.7616 * b5 - white * 0.0168980
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
            b6 = white * 0.115926
        }
    } else if (type === 'brown') {
        // Brown noise - integrated white noise
        let lastOut = 0
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1
            data[i] = (lastOut + (0.02 * white)) / 1.02
            lastOut = data[i]
            data[i] *= 3.5 // Boost volume
        }
    }

    return buffer
}

interface AmbientSoundNodes {
    source: AudioBufferSourceNode
    gainNode: GainNode
    filterNode?: BiquadFilterNode
}

function createAmbientSound(
    audioContext: AudioContext,
    type: AmbientSoundType,
    volume: number
): AmbientSoundNodes | null {
    if (type === 'none') return null

    let noiseType: 'white' | 'pink' | 'brown' = 'white'
    let filterFreq: number | null = null

    switch (type) {
        case 'rain':
            noiseType = 'pink'
            filterFreq = 1500 // Low-pass filter for rain sound
            break
        case 'coffee':
            noiseType = 'brown'
            filterFreq = 800 // Lower frequency for coffee shop ambience
            break
        case 'whitenoise':
            noiseType = 'white'
            filterFreq = 8000 // Softer white noise
            break
    }

    const buffer = createNoiseBuffer(audioContext, noiseType)
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gainNode = audioContext.createGain()
    gainNode.gain.value = volume / 100 * 0.3 // Scale down to reasonable level

    let filterNode: BiquadFilterNode | undefined

    if (filterFreq) {
        filterNode = audioContext.createBiquadFilter()
        filterNode.type = 'lowpass'
        filterNode.frequency.value = filterFreq
        filterNode.Q.value = 1

        source.connect(filterNode)
        filterNode.connect(gainNode)
    } else {
        source.connect(gainNode)
    }

    gainNode.connect(audioContext.destination)

    return { source, gainNode, filterNode }
}

export function useAmbientSound(
    initialSound: AmbientSoundType = 'none',
    initialVolume: number = 50
): UseAmbientSoundReturn {
    const [currentSound, setCurrentSound] = useState<AmbientSoundType>(initialSound)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolumeState] = useState(initialVolume)

    const audioContextRef = useRef<AudioContext | null>(null)
    const nodesRef = useRef<AmbientSoundNodes | null>(null)

    // Sync with initial values from settings
    useEffect(() => {
        setCurrentSound(initialSound)
    }, [initialSound])

    useEffect(() => {
        setVolumeState(initialVolume)
    }, [initialVolume])

    // Update volume on gain node
    useEffect(() => {
        if (nodesRef.current?.gainNode) {
            nodesRef.current.gainNode.gain.value = volume / 100 * 0.3
        }
    }, [volume])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (nodesRef.current?.source) {
                try {
                    nodesRef.current.source.stop()
                } catch (e) { /* ignore */ }
            }
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
        }
    }, [])

    const play = useCallback(() => {
        if (currentSound === 'none') return

        // Create new audio context if needed
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        }

        // Stop previous sound if any
        if (nodesRef.current?.source) {
            try {
                nodesRef.current.source.stop()
            } catch (e) { /* ignore */ }
        }

        // Create new ambient sound
        const nodes = createAmbientSound(audioContextRef.current, currentSound, volume)
        if (nodes) {
            nodesRef.current = nodes
            nodes.source.start()
            setIsPlaying(true)
            console.log(`🎵 Playing ${currentSound} ambient sound`)
        }
    }, [currentSound, volume])

    const pause = useCallback(() => {
        if (nodesRef.current?.source) {
            try {
                nodesRef.current.source.stop()
            } catch (e) { /* ignore */ }
            nodesRef.current = null
        }
        setIsPlaying(false)
        console.log('🔇 Ambient sound paused')
    }, [])

    const toggle = useCallback(() => {
        if (isPlaying) {
            pause()
        } else {
            play()
        }
    }, [isPlaying, play, pause])

    const setSound = useCallback((sound: AmbientSoundType) => {
        const wasPlaying = isPlaying
        if (isPlaying) {
            pause()
        }
        setCurrentSound(sound)

        // If was playing and new sound is not 'none', auto-play new sound
        if (wasPlaying && sound !== 'none') {
            // Small delay to let state update
            setTimeout(() => {
                play()
            }, 50)
        }
    }, [isPlaying, pause, play])

    const setVolume = useCallback((newVolume: number) => {
        setVolumeState(Math.max(0, Math.min(100, newVolume)))
    }, [])

    return {
        currentSound,
        isPlaying,
        volume,
        setSound,
        setVolume,
        play,
        pause,
        toggle,
    }
}
