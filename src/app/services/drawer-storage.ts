import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { appDataDir, join } from '@tauri-apps/api/path';
import { BaseDirectory, mkdir, readTextFile, writeTextFile, exists, copyFile, remove } from '@tauri-apps/plugin-fs';

interface NativeFileIcon {
    width: number;
    height: number;
    pixels: number[];
}

export interface StashedFileItem {
    id: string;
    name: string;
    originalPath: string;
    stashedPath: string;
    x: number;
    y: number;
    fileType: 'image' | 'archive' | 'folder' | 'document';
    iconData?: string;
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
                void this.loadMissingIcons(items);
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
            const iconData = await this.getIconData(originalPath);
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
                y,
                fileType: getFileType(name),
                iconData: iconData ?? undefined
            };

            const updated = [...this.stashedItems(), newItem];
            this.stashedItems.set(updated);
            await this.saveManifest(updated);
        } catch (error) {
            console.error('Error stashing file:', error);
        }
    }

    private async loadMissingIcons(items: StashedFileItem[]): Promise<void> {
        try {
            const icons = new Map<string, string>();
            const directory = await appDataDir();

            for (const item of items) {
                if (item.iconData) continue;

                try {
                    const path = await join(directory, item.stashedPath);
                    const iconData = await this.getIconData(path);
                    if (iconData) icons.set(item.id, iconData);
                } catch (error) {
                    console.warn(`Failed to load icon for stashed file "${item.name}":`, error);
                }
            }

            if (icons.size === 0) return;

            const updated = this.stashedItems().map(item => {
                const iconData = icons.get(item.id);
                return !item.iconData && iconData ? { ...item, iconData } : item;
            });
            this.stashedItems.set(updated);
            await this.saveManifest(updated);
        } catch (error) {
            console.error('Failed to load native icons for stashed files:', error);
        }
    }

    private async getIconData(path: string): Promise<string | null> {
        try {
            const icon = await invoke<NativeFileIcon>('get_file_icon', { path });
            const canvas = document.createElement('canvas');
            canvas.width = icon.width;
            canvas.height = icon.height;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Could not create a canvas context for the file icon');

            const pixels = new Uint8ClampedArray(icon.pixels);
            context.putImageData(new ImageData(pixels, icon.width, icon.height), 0, 0);
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.warn(`Failed to retrieve native icon for "${path}":`, error);
            return null;
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


function getFileType(filename: string): 'image' | 'archive' | 'folder' | 'document' {
    if (!filename) return 'document';

    const cleanName = filename.toLowerCase();
    const parts = cleanName.split('.');
    const ext = parts.length > 1 ? parts.pop() || '' : '';

    // 1. Check extension or name for Images
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'avif'].includes(ext)) {
        return 'image';
    }

    // 2. Check extension or name for Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2', 'iso'].includes(ext)) {
        return 'archive';
    }

    // 3. Check if it's a folder (no extension and doesn't look like a standard file)
    if (!ext || cleanName.endsWith('/')) {
        return 'folder';
    }

    return 'document';
}