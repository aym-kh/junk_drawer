import { Component, effect, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PhysicsService } from '../../services/physics';
import { DesktopFileService } from '../../services/desktop-file';
import { DrawerStorageService } from '../../services/drawer-storage';

@Component({
  selector: 'app-canvas-physics',
  standalone: true,
  template: `<div #canvasContainer class="canvas-container"></div>`,
  styles: [`
    .canvas-container {
      width: 100%;
      height: 100%;
    }
  `]
})
export class CanvasPhysicsComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;
  @Input() drawerOpen = false;
  private hasInitializedItems = false;

  private physicsService = inject(PhysicsService);
  private desktopFileService = inject(DesktopFileService);
  private drawerStorage = inject(DrawerStorageService);

  constructor() {
    effect(() => {
      const items = this.drawerStorage.stashedItems();
      if (items.length > 0 && !this.hasInitializedItems && this.physicsService) {
        this.hasInitializedItems = true;
        // Scatter restored items around the drawer like they were left in it
        items.forEach((item) => {
          this.physicsService.spawnBox(null, null, item.id, item.fileType, item.name);
        });
      }
    });
  }

  ngOnInit(): void {
    this.physicsService.init(this.canvasContainer.nativeElement);
  }

  ngOnDestroy(): void {
    this.physicsService.destroy();
  }
}