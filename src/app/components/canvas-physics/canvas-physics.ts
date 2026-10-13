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
  private initializedItemIds = new Set<string>();
  private itemIcons = new Map<string, string>();

  private physicsService = inject(PhysicsService);
  private desktopFileService = inject(DesktopFileService);
  private drawerStorage = inject(DrawerStorageService);

  constructor() {
    effect(() => {
      const items = this.drawerStorage.stashedItems();
      const activeIds = new Set(items.map(item => item.id));

      for (const id of this.initializedItemIds) {
        if (!activeIds.has(id)) {
          this.initializedItemIds.delete(id);
          this.itemIcons.delete(id);
        }
      }

      for (const item of items) {
        if (!this.initializedItemIds.has(item.id)) {
          this.initializedItemIds.add(item.id);
          if (!this.physicsService.hasFile(item.id)) {
            this.physicsService.spawnBox(null, null, item.id, item.fileType, item.name, item.iconData);
          }
        } else if (item.iconData && this.itemIcons.get(item.id) !== item.iconData) {
          this.physicsService.setFileIcon(item.id, item.iconData);
        }

        if (item.iconData) this.itemIcons.set(item.id, item.iconData);
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