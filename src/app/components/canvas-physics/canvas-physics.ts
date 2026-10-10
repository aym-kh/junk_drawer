import { Component, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PhysicsService } from '../../services/physics';

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

  ngOnInit(): void {
    this.physicsService.init(this.canvasContainer.nativeElement);
  }

  ngOnDestroy(): void {
    this.physicsService.destroy();
  }
}