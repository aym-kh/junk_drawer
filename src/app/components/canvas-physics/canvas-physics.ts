import { Component, effect, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PhysicsService } from '../../services/physics';
import { DesktopFileService } from '../../services/desktop-file';

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
  private physicsService = inject(PhysicsService);
  private desktopFileService = inject(DesktopFileService);

  constructor() {
    effect(() => {
      const dropped = this.desktopFileService.lastDroppedFile();
      if (dropped && this.drawerOpen) {
        this.physicsService.spawnBox(150, 20);
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