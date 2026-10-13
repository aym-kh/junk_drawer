import { inject, Injectable, signal } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { desktopDir, join } from '@tauri-apps/api/path';
import { readDir } from '@tauri-apps/plugin-fs';
import { register, unregister, ShortcutEvent } from '@tauri-apps/plugin-global-shortcut';
import { DrawerStorageService } from './drawer-storage';
import { PhysicsService } from './physics';
import { AudioService } from './audio';

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
    private audioService = inject(AudioService);

    constructor() {
        this.initTauriDragDropListeners();
        this.initShortcutListeners();
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
                        const newItem = this.drawerStorage.stashedItems().slice(-1)[0];
                        this.physicsService.spawnBox(position.x, position.y, newItem.id, newItem.fileType, newItem.name, newItem.iconData);
                    }
                } else if (event.payload.type === 'leave') {
                    this.isHovering.set(false);
                }
            });
        } catch (error) {
            console.warn('Tauri window drag-drop listener failed (Are you running in a standard browser?)', error);
        }
    }

    private async initShortcutListeners(): Promise<void> {
        try {
            // System-wide hotkeys, so the sweep works even from the desktop itself
            await this.registerShortcut('CommandOrControl+Shift+D', (event) => {
                if (event.state === 'Pressed') this.sweepDesktop();
            });
            await this.registerShortcut('CommandOrControl+Shift+R', (event) => {
                if (event.state === 'Pressed') this.restoreAll();
            });
        } catch (error) {
            // Not running inside Tauri (e.g. `ng serve`) — fall back to window shortcuts
            console.warn('Global shortcut registration failed, falling back to window shortcuts', error);
            window.addEventListener('keydown', (event) => {
                if (event.repeat || !event.shiftKey || !(event.ctrlKey || event.metaKey)) return;

                const key = event.key.toLowerCase();
                if (key === 'd') {
                    event.preventDefault();
                    this.sweepDesktop();
                } else if (key === 'r') {
                    event.preventDefault();
                    this.restoreAll();
                }
            });
        }
    }

    // Register a system-wide hotkey. The plugin keeps its registrations
    // process-wide, so a webview reload (dev HMR) finds the hotkey "already
    // registered" and still bound to a dead handler channel — drop that and
    // bind the fresh one. Any other rejection (e.g. another app owns the
    // hotkey) propagates to the window-shortcut fallback.
    private async registerShortcut(shortcut: string, handler: (event: ShortcutEvent) => void): Promise<void> {
        try {
            await register(shortcut, handler);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (!message.includes('already registered')) throw error;

            await unregister(shortcut);
            await register(shortcut, handler);
        }
    }

    // Panic sweep: stash every file on the desktop into the drawer
    public async sweepDesktop(): Promise<void> {
        try {
            const desktopPath = await desktopDir();
            const entries = await readDir(desktopPath);

            for (const entry of entries) {
                if (!entry.isFile || entry.name.startsWith('.')) continue;

                const filePath = await join(desktopPath, entry.name);
                await this.drawerStorage.stashFile(filePath, entry.name, 0, 0);
                const newItem = this.drawerStorage.stashedItems().slice(-1)[0];
                this.physicsService.spawnBox(null, null, newItem.id, newItem.fileType, newItem.name, newItem.iconData);
            }
        } catch (error) {
            console.error('Failed to sweep desktop into the drawer:', error);
        }
    }

    // Panic restore: bring every stashed file back to its original place
    public async restoreAll(): Promise<void> {
        try {
            const items = [...this.drawerStorage.stashedItems()];
            for (const item of items) {
                await this.drawerStorage.restoreFile(item.id);
                this.audioService.playPop();
            }

            this.physicsService.clearAll();
        } catch (error) {
            console.error('Failed to restore all stashed files:', error);
        }
    }
}