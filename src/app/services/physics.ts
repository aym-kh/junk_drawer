import { inject, Injectable } from '@angular/core';
import Matter from 'matter-js';
import { DrawerStorageService } from './drawer-storage';

@Injectable({
    providedIn: 'root'
})
export class PhysicsService {
    private engine!: Matter.Engine;
    private render!: Matter.Render;
    private runner!: Matter.Runner;
    private bodyToFileMap = new Map<number, string>(); // body.id -> file.id

    private drawerStorage = inject(DrawerStorageService);

    public init(container: HTMLElement): void {
        const width = container.clientWidth || 350;
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

        // Custom render hook to draw document icons instead of plain rectangles
        Matter.Events.on(this.render, 'afterRender', () => {
            const context = this.render.context;
            const allBodies = Matter.Composite.allBodies(this.engine.world);

            for (const body of allBodies) {
                // Skip static boundary walls
                if (body.isStatic) continue;

                const { x, y } = body.position;
                const angle = body.angle;

                context.save();
                context.translate(x, y);
                context.rotate(angle);

                // Document dimensions (44x54)
                const w = 44;
                const h = 54;
                const hw = w / 2;
                const hh = h / 2;

                // 1. Draw Document Base (White/Light Paper)
                context.fillStyle = '#f8fafc';
                context.strokeStyle = '#cbd5e1';
                context.lineWidth = 1.5;

                context.beginPath();
                context.moveTo(-hw, -hh);
                context.lineTo(hw - 10, -hh); // Fold corner cut
                context.lineTo(hw, -hh + 10);
                context.lineTo(hw, hh);
                context.lineTo(-hw, hh);
                context.closePath();
                context.fill();
                context.stroke();

                // 2. Draw Folded Corner Triangles
                context.fillStyle = '#e2e8f0';
                context.beginPath();
                context.moveTo(hw - 10, -hh);
                context.lineTo(hw, -hh + 10);
                context.lineTo(hw - 10, -hh + 10);
                context.closePath();
                context.fill();
                context.stroke();

                // 3. Draw Mini Text Lines on the Document
                context.fillStyle = '#94a3b8';
                context.fillRect(-hw + 8, -hh + 16, 20, 3);
                context.fillRect(-hw + 8, -hh + 24, 24, 3);
                context.fillRect(-hw + 8, -hh + 32, 16, 3);

                context.restore();
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

        this.render.canvas.addEventListener('dblclick', (event) => this.handleCanvasDoubleClick(event));
    }

    public spawnBox(x: number, y: number, fileId: string): void {
        if (!this.engine) return;
        const box = Matter.Bodies.rectangle(x || 150, y || 20, 50, 50, {
            restitution: 0.4,
            friction: 0.3,
            render: {
                visible: false // We'll handle rendering the file icon separately,
            }
        });

        // Map body ID to file ID
        this.bodyToFileMap.set(box.id, fileId);
        Matter.Composite.add(this.engine.world, box);
    }

    private handleCanvasDoubleClick(event: MouseEvent): void {
        const rect = this.render.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Find all bodies under the mouse click point
        const allBodies = Matter.Composite.allBodies(this.engine.world);
        const clickedBodies = Matter.Query.point(allBodies, { x: mouseX, y: mouseY });

        for (const body of clickedBodies) {
            const fileId = this.bodyToFileMap.get(body.id);
            if (fileId) {
                // 1. Restore file on filesystem & manifest
                this.drawerStorage.restoreFile(fileId);

                // 2. Remove body from physics world
                Matter.Composite.remove(this.engine.world, body);
                this.bodyToFileMap.delete(body.id);
                break;
            }
        }
    }

    public destroy(): void {
        if (this.render) Matter.Render.stop(this.render);
        if (this.runner) Matter.Runner.stop(this.runner);
        if (this.engine) Matter.Engine.clear(this.engine);
        this.bodyToFileMap.clear();
    }
}