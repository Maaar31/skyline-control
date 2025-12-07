// ========================================
// V1.3 - ENHANCED AUDIO MIXER
// ========================================

class AudioMixer {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.effectsGain = null;
        this.ambianceGain = null;
        this.ambianceLoop = null;
        this.initialized = false;

        this.volumes = {
            master: 1.0,
            effects: 1.0,
            ambiance: 0.5
        };
    }

    init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();

            // Create gain nodes
            this.masterGain = this.context.createGain();
            this.effectsGain = this.context.createGain();
            this.ambianceGain = this.context.createGain();

            // Connect chain
            this.effectsGain.connect(this.masterGain);
            this.ambianceGain.connect(this.masterGain);
            this.masterGain.connect(this.context.destination);

            // Set initial volumes
            this.masterGain.gain.value = this.volumes.master;
            this.effectsGain.gain.value = this.volumes.effects;
            this.ambianceGain.gain.value = this.volumes.ambiance;

            this.initialized = true;

            // Start ambient loop
            this.startAmbianceLoop();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    setMasterVolume(value) {
        this.volumes.master = value;
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }

    setEffectsVolume(value) {
        this.volumes.effects = value;
        if (this.effectsGain) {
            this.effectsGain.gain.value = value;
        }
    }

    setAmbianceVolume(value) {
        this.volumes.ambiance = value;
        if (this.ambianceGain) {
            this.ambianceGain.gain.value = value;
        }
    }

    // Enhanced sound generation with harmonics
    createEnhancedBeep(frequency, duration, type = 'sine', harmonics = []) {
        if (!this.initialized || !gameState.soundEnabled) return;

        const now = this.context.currentTime;
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.effectsGain);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        // ADSR envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05); // Decay
        gainNode.gain.setValueAtTime(0.2, now + duration - 0.05); // Sustain
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release

        oscillator.start(now);
        oscillator.stop(now + duration);

        // Add harmonics for richer sound
        harmonics.forEach(({ freq, gain: harmGain }) => {
            const harmOsc = this.context.createOscillator();
            const harmGainNode = this.context.createGain();

            harmOsc.connect(harmGainNode);
            harmGainNode.connect(this.effectsGain);

            harmOsc.frequency.value = frequency * freq;
            harmOsc.type = 'sine';
            harmGainNode.gain.value = harmGain;

            harmOsc.start(now);
            harmOsc.stop(now + duration);
        });
    }

    // Ambient radar loop
    startAmbianceLoop() {
        if (!this.initialized) return;

        const playRadarBlip = () => {
            if (!gameState.soundEnabled || !gameState.running) {
                setTimeout(playRadarBlip, 2000);
                return;
            }

            const now = this.context.currentTime;
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.connect(gain);
            gain.connect(this.ambianceGain);

            osc.frequency.value = 1200;
            osc.type = 'sine';

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.start(now);
            osc.stop(now + 0.1);

            // Random interval between 1.5-2.5 seconds
            const nextInterval = 1500 + Math.random() * 1000;
            setTimeout(playRadarBlip, nextInterval);
        };

        playRadarBlip();
    }

    // Enhanced sound effects
    playSelect() {
        this.createEnhancedBeep(800, 0.1, 'sine', [
            { freq: 2, gain: 0.1 },
            { freq: 3, gain: 0.05 }
        ]);
    }

    playWaypoint() {
        this.createEnhancedBeep(600, 0.08, 'sine', [
            { freq: 2, gain: 0.08 }
        ]);
    }

    playEmergency() {
        const now = this.context.currentTime;

        // Siren-like sound
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createEnhancedBeep(400, 0.2, 'square');
                setTimeout(() => {
                    this.createEnhancedBeep(500, 0.2, 'square');
                }, 200);
            }, i * 400);
        }
    }

    playCollision() {
        // Explosion sound with noise
        const now = this.context.currentTime;
        const duration = 0.8;

        // Low rumble
        const rumble = this.context.createOscillator();
        const rumbleGain = this.context.createGain();
        rumble.connect(rumbleGain);
        rumbleGain.connect(this.effectsGain);

        rumble.frequency.value = 50;
        rumble.type = 'sawtooth';

        rumbleGain.gain.setValueAtTime(0.4, now);
        rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        rumble.start(now);
        rumble.stop(now + duration);

        // High crash
        for (let i = 0; i < 5; i++) {
            const freq = 200 + Math.random() * 300;
            this.createEnhancedBeep(freq, 0.1 + Math.random() * 0.2, 'sawtooth');
        }
    }

    playLanding() {
        // Success chime
        this.createEnhancedBeep(800, 0.1, 'sine');
        setTimeout(() => {
            this.createEnhancedBeep(1000, 0.1, 'sine');
        }, 100);
        setTimeout(() => {
            this.createEnhancedBeep(1200, 0.15, 'sine', [
                { freq: 2, gain: 0.1 }
            ]);
        }, 200);
    }

    playSpawn() {
        // Whoosh sound
        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.connect(gain);
        gain.connect(this.effectsGain);

        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        osc.type = 'sawtooth';

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    playAltitudeChange() {
        // Swoosh
        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.connect(gain);
        gain.connect(this.effectsGain);

        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.15);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playUIClick() {
        this.createEnhancedBeep(1000, 0.05, 'sine');
    }

    playUIHover() {
        this.createEnhancedBeep(800, 0.03, 'sine');
    }
}

// Create global audio mixer
const audioMixer = new AudioMixer();

// Initialize on first user interaction
document.addEventListener('click', () => {
    if (!audioMixer.initialized) {
        audioMixer.init();
    }
}, { once: true });

// Export for use in other files
window.audioMixer = audioMixer;
