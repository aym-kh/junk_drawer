import { inject, Injectable, signal } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { DrawerStorageService } from './drawer-storage';
import { PhysicsService } from './physics';

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

    private drawerStorage = inject(DrawerStorageService);
    private physicsService = inject(PhysicsService);

    constructor() {
        this.initTauriDragDropListeners();
    }

    private async initTauriDragDropListeners(): Promise<void> {
        try {
            const appWindow = getCurrentWindow();

            await appWindow.onDragDropEvent(async (event) => {
                if (event.payload.type === 'over') {
                    this.isHovering.set(true);
                } else if (event.payload.type === 'drop') {
                    this.isHovering.set(false);
                    const paths = event.payload.paths;
                    const position = event.payload.position;

                    for (const filePath of paths) {
                        const fileName = filePath.split(/[/\\]/).pop() || 'Unknown File';
                        await this.drawerStorage.stashFile(filePath, fileName, position.x, position.y);
                        this.physicsService.spawnBox(150, 20);
                    }
                } else if (event.payload.type === 'leave') {
                    this.isHovering.set(false);
                }
            });
        } catch (error) {
            console.warn('Tauri window drag-drop listener failed (Are you running in a standard browser?)', error);
        }
    }
}