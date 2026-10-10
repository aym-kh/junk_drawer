import { Injectable } from '@angular/core';
import Matter from 'matter-js';

@Injectable({
    providedIn: 'root'
})
export class PhysicsService {
    private engine!: Matter.Engine;
    private render!: Matter.Render;
    private runner!: Matter.Runner;

    public init(container: HTMLElement): void {
        const width = container.clientWidth || 392;
        const height = container.clientHeight || 350;

        this.engine = Matter.Engine.create();

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

        // Floor and walls
        const ground = Matter.Bodies.rectangle(width / 2, height + 10, width, 30, { isStatic: true });
        const leftWall = Matter.Bodies.rectangle(-10, height / 2, 30, height, { isStatic: true });
        const rightWall = Matter.Bodies.rectangle(width + 10, height / 2, 30, height, { isStatic: true });

        Matter.Composite.add(this.engine.world, [ground, leftWall, rightWall]);

        Matter.Render.run(this.render);
        this.runner = Matter.Runner.create();
        Matter.Runner.run(this.runner, this.engine);
    }

    public spawnBox(x: number, y: number): void {
        if (!this.engine) return;
        const box = Matter.Bodies.rectangle(x || 150, y || 20, 50, 50, {
            restitution: 0.4,
            friction: 0.3,
            render: {
                fillStyle: '#e74c3c'
            }
        });
        Matter.Composite.add(this.engine.world, box);
    }

    public destroy(): void {
        if (this.render) Matter.Render.stop(this.render);
        if (this.runner) Matter.Runner.stop(this.runner);
        if (this.engine) Matter.Engine.clear(this.engine);
    }
}