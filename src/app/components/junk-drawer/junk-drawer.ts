import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CanvasPhysicsComponent } from '../canvas-physics/canvas-physics';
import { currentMonitor, getCurrentWindow, LogicalPosition } from '@tauri-apps/api/window';
import { AudioService } from '../../services/audio';
import { DrawerStorageService } from '../../services/drawer-storage';

@Component({
  imports: [CommonModule, CanvasPhysicsComponent],
  selector: 'app-junk-drawer',
  styleUrl: './junk-drawer.css',
  templateUrl: './junk-drawer.html',
})
export class JunkDrawer implements OnInit {
  isOpen = signal<boolean>(false);
  private audioService = inject(AudioService);
  private drawerStorage = inject(DrawerStorageService);
  isOverstuffed = computed(() => this.drawerStorage.stashedItems().length > 20);

  async ngOnInit() {
    try {
      const appWindow = await getCurrentWindow();
      const monitor = await currentMonitor();

      if (monitor) {
        const screenWidth = monitor.size.width / monitor.scaleFactor;
        const screenHeight = monitor.size.height / monitor.scaleFactor;

        // Window dimensions defined in tauri.conf.json
        const windowWidth = 350;
        const windowHeight = 450;

        const targetX = screenWidth - windowWidth - 10;
        const targetY = screenHeight - windowHeight - 30;

        await appWindow.setPosition(new LogicalPosition(targetX, targetY));
      }
    } catch (error) {
      console.warn('Failed to snap window position:', error);
    }
  }

  toggleDrawer() {
    this.isOpen.update(open => !open);

    // An overstuffed drawer squeaks on its hinge
    if (this.isOverstuffed()) {
      this.audioService.playSqueak();
    } else {
      this.audioService.playClick();
    }
  }
}
