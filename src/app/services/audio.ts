import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AudioService {
    private audioCtx: AudioContext | null = null;

    private initContext() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    // Soft wooden thud when a file lands or drops
    public playThud(): void {
        try {
            this.initContext();
            if (!this.audioCtx) return;

            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(120, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.12);

            gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.12);
        } catch (e) {
            console.warn('Audio play failed:', e);
        }
    }

    // Crisp mechanical click for opening/closing or sliding
    public playClick(): void {
        try {
            this.initContext();
            if (!this.audioCtx) return;

            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.04);

            gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.04);
        } catch (e) {
            console.warn('Audio play failed:', e);
        }
    }

    // Snappy pop sound when restoring / ejecting a file
    public playPop(): void {
        try {
            this.initContext();
            if (!this.audioCtx) return;

            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(700, this.audioCtx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.08);
        } catch (e) {
            console.warn('Audio play failed:', e);
        }
    }

    // Rusty hinge squeak for an overstuffed drawer
    public playSqueak(): void {
        try {
            this.initContext();
            if (!this.audioCtx) return;

            const now = this.audioCtx.currentTime;
            this.squeakPulse(this.audioCtx, now, 0.12);
            this.squeakPulse(this.audioCtx, now + 0.16, 0.2);
        } catch (e) {
            console.warn('Audio play failed:', e);
        }
    }

    private squeakPulse(ctx: AudioContext, start: number, duration: number): void {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, start);
        osc.frequency.linearRampToValueAtTime(650, start + duration);

        // Fast pitch wobble is what makes it squeak instead of hum
        lfo.type = 'sine';
        lfo.frequency.value = 35;
        lfoGain.gain.value = 140;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        filter.type = 'lowpass';
        filter.frequency.value = 2400;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        lfo.start(start);
        osc.start(start);
        lfo.stop(start + duration + 0.05);
        osc.stop(start + duration + 0.05);
    }
}