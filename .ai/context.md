# Project Context: Junk Drawer

## Tech Stack & Core Libraries
- **Desktop Framework:** Tauri v2
- **Frontend Framework:** Angular (Standalone Components, Signals)
- **Physics Engine:** Matter.js
- **Animations:** GSAP / Framer Motion
- **Sound:** Web Audio API / Howler.js

## Architecture & Conventions
- Use **Angular Signals** (`signal()`, `computed()`, `effect()`) for reactive state management.
- Isolate non-Angular DOM interactions (like the Matter.js canvas engine) strictly within dedicated component lifecycle hooks (`ngOnInit` / `ngOnDestroy`) or directives using `@ViewChild`.
- Keep Tauri Rust IPC calls abstracted behind Angular services (e.g., `DrawerStorageService`, `DesktopFileService`).

## Current Sprint / Active Focus
- [ ] Phase 1: Tauri + Angular layout setup (transparent window configuration).
- [ ] Phase 2: Drag-and-drop dropzone detection on desktop surface.