import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { CanvasPhysicsComponent } from '../canvas-physics/canvas-physics';

@Component({
  imports: [CommonModule, CanvasPhysicsComponent],
  selector: 'app-junk-drawer',
  styleUrl: './junk-drawer.css',
  templateUrl: './junk-drawer.html',
})
export class JunkDrawer {
  isOpen = signal<boolean>(false);

  toggleDrawer() {
    this.isOpen.update(open => !open);
    // TODO: Trigger velocity-aware slide audio via AudioService
  }
}
