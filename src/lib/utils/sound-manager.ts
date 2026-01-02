/**
 * Sound Manager for Chat Notifications
 * Handles playing notification sounds for send/receive messages
 * Uses Web Audio API to generate Discord-like notification beeps
 */

class SoundManager {
    private audioContext: AudioContext | null = null
    private enabled: boolean = true
    private volume: number = 0.5

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadPreferences()
        }
    }

    private loadPreferences() {
        const saved = localStorage.getItem('chatSoundPreferences')
        if (saved) {
            try {
                const prefs = JSON.parse(saved)
                this.enabled = prefs.enabled ?? true
                this.volume = prefs.volume ?? 0.5
            } catch (e) {
                console.error('Failed to load sound preferences:', e)
            }
        }
    }

    private savePreferences() {
        localStorage.setItem('chatSoundPreferences', JSON.stringify({
            enabled: this.enabled,
            volume: this.volume
        }))
    }

    private getAudioContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        return this.audioContext
    }

    /**
     * Play a notification beep using Web Audio API
     * @param frequency - Frequency in Hz (higher = higher pitch)
     * @param duration - Duration in seconds
     * @param type - Waveform type
     */
    private playBeep(frequency: number, duration: number = 0.1, type: OscillatorType = 'sine') {
        if (!this.enabled) return

        try {
            const ctx = this.getAudioContext()

            // Resume audio context if suspended (browser autoplay policy)
            if (ctx.state === 'suspended') {
                ctx.resume()
            }

            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            oscillator.frequency.value = frequency
            oscillator.type = type

            // Envelope for smooth sound
            gainNode.gain.setValueAtTime(0, ctx.currentTime)
            gainNode.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.01)
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

            oscillator.start(ctx.currentTime)
            oscillator.stop(ctx.currentTime + duration)
        } catch (error) {
            console.error('Failed to play sound:', error)
        }
    }

    /**
     * Play a custom audio file from /public/sounds/
     * @param filename - Name of the audio file in /public/sounds/
     */
    private playAudioFile(filename: string) {
        if (!this.enabled) return

        try {
            const audio = new Audio(`/sounds/${filename}`)
            audio.volume = this.volume
            audio.play().catch(err => {
                console.warn('Audio play failed (may need user interaction first):', err)
            })
        } catch (error) {
            console.error('Failed to play audio file:', error)
        }
    }

    /**
     * Play send message sound (Discord-like whoosh)
     */
    playSendSound() {
        // Try to play custom sound file first, fallback to beep
        if (this.checkSoundFileExists('message-send.mp3')) {
            this.playAudioFile('message-send.mp3')
        } else {
            // Discord-like send sound: quick rising tone
            this.playBeep(800, 0.08, 'sine')
        }
    }

    /**
     * Play receive message sound (Discord-like notification)
     */
    playReceiveSound() {
        // Try to play custom sound file first, fallback to beep
        if (this.checkSoundFileExists('message-receive.mp3')) {
            this.playAudioFile('message-receive.mp3')
        } else {
            // Discord-like receive sound: two-tone notification
            this.playBeep(600, 0.08, 'sine')
            setTimeout(() => {
                this.playBeep(800, 0.08, 'sine')
            }, 80)
        }
    }

    /**
     * Play message delivery confirmation sound
     */
    playDeliverySound() {
        if (this.checkSoundFileExists('message-delivery.mp3')) {
            this.playAudioFile('message-delivery.mp3')
        } else {
            // Subtle confirmation beep
            this.playBeep(1000, 0.05, 'sine')
        }
    }

    /**
     * Check if a sound file exists (basic check)
     */
    private checkSoundFileExists(filename: string): boolean {
        // Simple check - you can enhance this by actually testing the file
        // For now, we'll assume custom files don't exist and use Web Audio API
        return false
    }

    /**
     * Toggle sound notifications on/off
     */
    toggle(): boolean {
        this.enabled = !this.enabled
        this.savePreferences()
        return this.enabled
    }

    /**
     * Set enabled state
     */
    setEnabled(enabled: boolean) {
        this.enabled = enabled
        this.savePreferences()
    }

    /**
     * Get enabled state
     */
    isEnabled(): boolean {
        return this.enabled
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume))
        this.savePreferences()
    }

    /**
     * Get current volume
     */
    getVolume(): number {
        return this.volume
    }

    /**
     * Play a test sound
     */
    playTestSound() {
        this.playReceiveSound()
    }
}

// Export singleton instance
export const soundManager = new SoundManager()

// Export class for testing
export default SoundManager
