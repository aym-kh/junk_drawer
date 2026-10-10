import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Matter from 'matter-js';

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

  private engine!: Matter.Engine;
  private render!: Matter.Render;
  private runner!: Matter.Runner;

  ngOnInit(): void {
    this.initPhysics();
  }

  private initPhysics(): void {
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth || 392;
    const height = container.clientHeight || 350;

    // Create Matter engine & world
    this.engine = Matter.Engine.create();

    // Create renderer
    this.render = Matter.Render.create({
      element: container,
      engine: this.engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent'
      }
    });

    // Boundaries (Drawer floor and walls)
    const ground = Matter.Bodies.rectangle(width / 2, height + 10, width, 30, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(-10, height / 2, 30, height, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(width + 10, height / 2, 30, height, { isStatic: true });

    Matter.Composite.add(this.engine.world, [ground, leftWall, rightWall]);

    // Start engine and renderer
    Matter.Render.run(this.render);
    this.runner = Matter.Runner.create();
    Matter.Runner.run(this.runner, this.engine);
  }

  // Public method to spawn new file icon boxes into the physics world
  public addFileIcon(x: number, y: number, label: string): void {
    const box = Matter.Bodies.rectangle(x, y, 60, 60, {
      restitution: 0.4,
      friction: 0.2,
      render: {
        fillStyle: '#3498db'
      }
    });

    Matter.Composite.add(this.engine.world, box);
  }

  ngOnDestroy(): void {
    if (this.render) Matter.Render.stop(this.render);
    if (this.runner) Matter.Runner.stop(this.runner);
    if (this.engine) Matter.Engine.clear(this.engine);
  }
}