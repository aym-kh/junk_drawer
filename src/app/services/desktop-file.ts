import { Injectable, signal } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

export interface DroppedFile {
    path: string;
    name: string;
    x: number;
    y: number;
}

@Injectable({
    providedIn: 'root'
})
export class DesktopFileService {
    lastDroppedFile = signal<DroppedFile | null>(null);
    isHovering = signal<boolean>(false);

    constructor() {
        this.initTauriDragDropListeners();
    }

    private async initTauriDragDropListeners(): Promise<void> {
        try {
            const appWindow = getCurrentWindow();

            await appWindow.onDragDropEvent((event) => {
                if (event.payload.type === 'over') {
                    this.isHovering.set(true);
                } else if (event.payload.type === 'drop') {
                    this.isHovering.set(false);
                    const paths = event.payload.paths;
                    const position = event.payload.position;

                    paths.forEach((filePath) => {
                        const fileName = filePath.split(/[/\\]/).pop() || 'Unknown File';
                        this.lastDroppedFile.set({
                            path: filePath,
                            name: fileName,
                            x: position.x,
                            y: position.y
                        });
                    });
                } else if (event.payload.type === 'leave') {
                    this.isHovering.set(false);
                }
            });
        } catch (error) {
            console.warn('Tauri window drag-drop listener failed (Are you running in a standard browser?)', error);
        }
    }
}