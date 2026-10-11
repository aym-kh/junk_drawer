import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AudioService {
    private currentSample: HTMLAudioElement | null = null;

    private playSample(fileName: string): void {
        this.currentSample?.pause();
        if (this.currentSample) {
            this.currentSample.currentTime = 0;
        }

        const sample = new Audio(`assets/sound/${fileName}`);
        this.currentSample = sample;

        sample.addEventListener('error', () => {
            console.warn(`Failed to load audio sample: ${fileName}`);
        }, { once: true });
        sample.addEventListener('ended', () => {
            if (this.currentSample === sample) {
                this.currentSample = null;
            }
        }, { once: true });

        void sample.play().catch(error => {
            if (this.currentSample === sample) {
                this.currentSample = null;
            }
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }
            console.warn(`Audio play failed for ${fileName}:`, error);
        });
    }

    public playThud(): void {
        this.playSample('freesound_community-luggage-drop-1-47660.mp3');
    }

    public playClick(): void {
        this.playSample('freesound_community-drawer-open-mid-84663.mp3');
    }

    public playPop(): void {
        this.playSample('freesound_community-luggage-drop-1-47660.mp3');
    }

    public playSqueak(): void {
        this.playSample('freesound_community-door_squeak-39982.mp3');
    }

    public playSearch(): void {
        this.playSample('freesound_community-searching-through-desk-drawer-88854.mp3');
    }
}
