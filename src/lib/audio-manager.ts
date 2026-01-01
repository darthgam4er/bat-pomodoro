"use client"

import { AmbientSoundType, AMBIENT_SOUNDS } from '@/lib/audio-config'

// Global singleton audio manager - persists across page navigation
class AmbientAudioManager {
    private static instance: AmbientAudioManager | null = null
    private audioContext: AudioContext | null = null
    private currentSound: AmbientSoundType = 'none'
    private isPlaying: boolean = false
    private volume: number = 50

    // Audio nodes
    private leftOsc: OscillatorNode | null = null
    private rightOsc: OscillatorNode | null = null
    private binauralGain: GainNode | null = null
    private noiseSource: AudioBufferSourceNode | null = null
    private noiseGain: GainNode | null = null
    private audioElement: HTMLAudioElement | null = null
    private externalWindow: Window | null = null

    // Callbacks for state updates
    private onStateChange: (() => void) | null = null

    private constructor() { }

    static getInstance(): AmbientAudioManager {
        if (!AmbientAudioManager.instance) {
            AmbientAudioManager.instance = new AmbientAudioManager()
        }
        return AmbientAudioManager.instance
    }

    setOnStateChange(callback: () => void) {
        this.onStateChange = callback
    }

    private notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange()
        }
    }

    getState() {
        return {
            currentSound: this.currentSound,
            isPlaying: this.isPlaying,
            volume: this.volume
        }
    }

    private getAudioContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume()
        }
        return this.audioContext
    }

    private createNoiseBuffer(type: 'white' | 'pink' | 'brown'): AudioBuffer {
        const ctx = this.getAudioContext()
        const bufferSize = ctx.sampleRate * 2
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)

        if (type === 'white') {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1
            }
        } else if (type === 'pink') {
            // Pink noise - Paul Kellet's algorithm
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
            // Brown noise - integrated white noise (Brownian motion)
            let lastOut = 0
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1
                lastOut = (lastOut + 0.02 * white) / 1.02
                data[i] = lastOut * 3.5 // Boost volume
            }
        }
        return buffer
    }

    stop() {
        // Stop binaural beats
        if (this.leftOsc) {
            try { this.leftOsc.stop() } catch { }
            this.leftOsc = null
        }
        if (this.rightOsc) {
            try { this.rightOsc.stop() } catch { }
            this.rightOsc = null
        }
        if (this.binauralGain) {
            this.binauralGain.disconnect()
            this.binauralGain = null
        }

        // Stop noise
        if (this.noiseSource) {
            try { this.noiseSource.stop() } catch { }
            this.noiseSource = null
        }
        if (this.noiseGain) {
            this.noiseGain.disconnect()
            this.noiseGain = null
        }

        // Stop audio element
        if (this.audioElement) {
            this.audioElement.pause()
            this.audioElement.currentTime = 0
            this.audioElement = null
        }

        // Note: We deliberately do NOT close external windows (URL)
        // because users might want to keep the music going even if they pause the timer.
        // The window handle is kept for focus() on resume.

        this.isPlaying = false
        this.notifyStateChange()
    }

    play(sound?: AmbientSoundType) {
        const soundToPlay = sound ?? this.currentSound
        if (soundToPlay === 'none') {
            this.stop()
            return
        }

        const config = AMBIENT_SOUNDS.find(s => s.id === soundToPlay)
        if (!config) return

        // Stop any current sound
        this.stop()

        this.currentSound = soundToPlay
        const ctx = this.getAudioContext()

        if (config.generator === 'binaural') {
            // 40Hz binaural beats: 200Hz left, 240Hz right
            this.leftOsc = ctx.createOscillator()
            this.rightOsc = ctx.createOscillator()
            this.leftOsc.frequency.value = 200
            this.rightOsc.frequency.value = 240
            this.leftOsc.type = 'sine'
            this.rightOsc.type = 'sine'

            const leftGain = ctx.createGain()
            const rightGain = ctx.createGain()
            leftGain.gain.value = this.volume / 100 * 0.15
            rightGain.gain.value = this.volume / 100 * 0.15

            const merger = ctx.createChannelMerger(2)
            this.leftOsc.connect(leftGain)
            this.rightOsc.connect(rightGain)
            leftGain.connect(merger, 0, 0)
            rightGain.connect(merger, 0, 1)

            this.binauralGain = ctx.createGain()
            this.binauralGain.gain.value = 1
            merger.connect(this.binauralGain)
            this.binauralGain.connect(ctx.destination)

            this.leftOsc.start()
            this.rightOsc.start()
            this.isPlaying = true
            console.log('🧠 Playing 40Hz Binaural Beats (use headphones!)')

        } else if (config.generator === 'pinknoise' || config.generator === 'whitenoise' || config.generator === 'brownnoise') {
            const noiseType = config.generator === 'pinknoise' ? 'pink' : config.generator === 'brownnoise' ? 'brown' : 'white'
            const buffer = this.createNoiseBuffer(noiseType)
            this.noiseSource = ctx.createBufferSource()
            this.noiseSource.buffer = buffer
            this.noiseSource.loop = true

            this.noiseGain = ctx.createGain()
            this.noiseGain.gain.value = this.volume / 100 * 0.25

            // Lowpass filter for softer sound
            const filter = ctx.createBiquadFilter()
            filter.type = 'lowpass'
            // Brown noise gets lower cutoff for deeper bass
            filter.frequency.value = config.generator === 'brownnoise' ? 2000 :
                config.generator === 'pinknoise' ? 5000 : 7000
            filter.Q.value = 0.5

            this.noiseSource.connect(filter)
            filter.connect(this.noiseGain)
            this.noiseGain.connect(ctx.destination)
            this.noiseSource.start()
            this.isPlaying = true
            console.log(`${config.icon} Playing ${config.name}`)

        } else if (config.file) {
            // Audio files (noise or NSDR)
            this.audioElement = new Audio(config.file)
            this.audioElement.volume = this.volume / 100
            // Loop noise files, don't loop NSDR
            const shouldLoop = config.id === 'pinknoise' || config.id === 'brownnoise'
            this.audioElement.loop = shouldLoop
            this.audioElement.play().then(() => {
                this.isPlaying = true
                console.log(`${config.icon} Playing ${config.name}`)
                this.notifyStateChange()
            }).catch(e => console.error('Audio play failed:', e))

            if (!shouldLoop) {
                // Only set onended for non-looping audio (NSDR)
                this.audioElement.onended = () => {
                    this.isPlaying = false
                    this.audioElement = null
                    console.log(`${config.icon} ${config.name} completed`)
                    this.notifyStateChange()
                }
            }
            return // Don't notify yet, wait for play promise
        }

        this.notifyStateChange()
    }

    setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(100, vol))

        // Update active audio
        if (this.binauralGain) {
            this.binauralGain.gain.value = this.volume / 100 * 0.15
        }
        if (this.noiseGain) {
            this.noiseGain.gain.value = this.volume / 100 * 0.25
        }
        if (this.audioElement) {
            this.audioElement.volume = this.volume / 100
        }
        this.notifyStateChange()
    }

    setSound(sound: AmbientSoundType) {
        const wasPlaying = this.isPlaying
        this.currentSound = sound
        if (wasPlaying && sound !== 'none') {
            this.play(sound)
        } else if (sound === 'none') {
            this.stop()
        }
        this.notifyStateChange()
    }

    toggle() {
        if (this.isPlaying) {
            this.stop()
        } else {
            this.play()
        }
    }
}

// Export singleton getter
export const getAmbientAudioManager = () => AmbientAudioManager.getInstance()
