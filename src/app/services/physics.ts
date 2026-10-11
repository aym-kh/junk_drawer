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
    private bodyTypeMap = new Map<number, string>(); // body.id -> fileType

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
                if (body.isStatic) continue;

                const { x, y } = body.position;
                const angle = body.angle;
                const fileType = this.bodyTypeMap.get(body.id) || 'document';

                context.save();
                context.translate(x, y);
                context.rotate(angle);

                const w = 44;
                const h = 54;
                const hw = w / 2;
                const hh = h / 2;

                if (fileType === 'image') {
                    // --- IMAGE FILE ICON (Dark slate card with a picture/mountain preview motif) ---
                    context.fillStyle = '#1e293b';
                    context.strokeStyle = '#475569';
                    context.lineWidth = 1.5;
                    context.fillRect(-hw, -hh, w, h);
                    context.strokeRect(-hw, -hh, w, h);

                    // Mini photo preview square inside
                    context.fillStyle = '#38bdf8';
                    context.fillRect(-hw + 6, -hh + 8, w - 12, 24);
                    // Mountain landscape graphic
                    context.fillStyle = '#bae6fd';
                    context.beginPath();
                    context.moveTo(-hw + 6, -hh + 24);
                    context.lineTo(-hw + 16, -hh + 14);
                    context.lineTo(-hw + 24, -hh + 22);
                    context.lineTo(-hw + 32, -hh + 12);
                    context.lineTo(-hw + w - 6, -hh + 24);
                    context.closePath();
                    context.fill();

                } else if (fileType === 'archive') {
                    // --- ARCHIVE / ZIP ICON (Amber/Yellow zipped folder look) ---
                    context.fillStyle = '#f59e0b';
                    context.strokeStyle = '#d97706';
                    context.lineWidth = 1.5;
                    context.fillRect(-hw, -hh, w, h);
                    context.strokeRect(-hw, -hh, w, h);

                    // Zipper line down the middle
                    context.strokeStyle = '#fef3c7';
                    context.setLineDash([2, 2]);
                    context.beginPath();
                    context.moveTo(0, -hh + 6);
                    context.lineTo(0, hh - 6);
                    context.stroke();
                    context.setLineDash([]);

                } else {
                    // --- STANDARD DOCUMENT ICON (White paper with folded corner) ---
                    context.fillStyle = '#f8fafc';
                    context.strokeStyle = '#cbd5e1';
                    context.lineWidth = 1.5;

                    context.beginPath();
                    context.moveTo(-hw, -hh);
                    context.lineTo(hw - 10, -hh);
                    context.lineTo(hw, -hh + 10);
                    context.lineTo(hw, hh);
                    context.lineTo(-hw, hh);
                    context.closePath();
                    context.fill();
                    context.stroke();

                    // Folded corner shadow
                    context.fillStyle = '#e2e8f0';
                    context.beginPath();
                    context.moveTo(hw - 10, -hh);
                    context.lineTo(hw, -hh + 10);
                    context.lineTo(hw - 10, -hh + 10);
                    context.closePath();
                    context.fill();
                    context.stroke();

                    // Text lines
                    context.fillStyle = '#94a3b8';
                    context.fillRect(-hw + 8, -hh + 16, 20, 3);
                    context.fillRect(-hw + 8, -hh + 24, 24, 3);
                    context.fillRect(-hw + 8, -hh + 32, 16, 3);
                }

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

    public spawnBox(x: number, y: number, fileId: string, fileType: 'image' | 'archive' | 'folder' | 'document' = 'document'): void {
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
        this.bodyTypeMap.set(box.id, fileType);
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
        this.bodyTypeMap.clear();
    }
}