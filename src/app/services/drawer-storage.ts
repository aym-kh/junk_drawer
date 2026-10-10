import { Injectable, signal } from '@angular/core';
import { BaseDirectory, mkdir, readTextFile, writeTextFile, exists, copyFile, remove } from '@tauri-apps/plugin-fs';

export interface StashedFileItem {
    id: string;
    name: string;
    originalPath: string;
    stashedPath: string;
    x: number;
    y: number;
}

@Injectable({
    providedIn: 'root'
})
export class DrawerStorageService {
    stashedItems = signal<StashedFileItem[]>([]);
    private manifestFileName = 'junk_manifest.json';

    constructor() {
        this.initStorage();
    }

    private async initStorage(): Promise<void> {
        try {
            const dirExists = await exists('', { baseDir: BaseDirectory.AppData });

            if (!dirExists) {
                await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
            }
            await this.loadManifest();
        } catch (error) {
            console.error('Failed to initialize junk drawer storage:', error);
        }
    }

    private async loadManifest(): Promise<void> {
        try {
            const fileExists = await exists(this.manifestFileName, { baseDir: BaseDirectory.AppData });
            if (fileExists) {
                const content = await readTextFile(this.manifestFileName, { baseDir: BaseDirectory.AppData });
                const items: StashedFileItem[] = JSON.parse(content);
                this.stashedItems.set(items);
            }
        } catch (error) {
            console.error('Failed to load junk manifest:', error);
        }
    }

    private async saveManifest(items: StashedFileItem[]): Promise<void> {
        try {
            await writeTextFile(this.manifestFileName, JSON.stringify(items, null, 2), {
                baseDir: BaseDirectory.AppData
            });
        } catch (error) {
            console.error('Failed to save junk manifest:', error);
        }
    }

    public async stashFile(originalPath: string, name: string, x: number, y: number): Promise<void> {
        try {
            const stashedFileName = `${Date.now()}_${name}`;

            // Copy file to AppData storage and then remove original from desktop to simulate "moving"
            await copyFile(originalPath, stashedFileName, {
                fromPathBaseDir: undefined,
                toPathBaseDir: BaseDirectory.AppData
            });

            await remove(originalPath);

            const newItem: StashedFileItem = {
                id: crypto.randomUUID(),
                name,
                originalPath,
                stashedPath: stashedFileName,
                x,
                y
            };

            const updated = [...this.stashedItems(), newItem];
            this.stashedItems.set(updated);
            await this.saveManifest(updated);
        } catch (error) {
            console.error('Error stashing file:', error);
        }
    }

    public async restoreFile(id: string): Promise<void> {
        try {
            const item = this.stashedItems().find(i => i.id === id);
            if (!item) return;

            // Copy file back from junk_drawer storage to original desktop path
            await copyFile(item.stashedPath, item.originalPath, {
                fromPathBaseDir: BaseDirectory.AppData,
                toPathBaseDir: undefined
            });

            // Remove file from junk_drawer storage
            await remove(item.stashedPath, {
                baseDir: BaseDirectory.AppData
            });

            // Update manifest signal and storage
            const updated = this.stashedItems().filter(i => i.id !== id);
            this.stashedItems.set(updated);
            await this.saveManifest(updated);
        } catch (error) {
            console.error('Error restoring file:', error);
        }
    }
}