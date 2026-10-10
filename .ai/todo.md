# Project Todo: Junk Drawer


## Phase 1: Native Overlay & Angular Base Setup
* [x] Initialize Tauri v2 project with Angular frontend.
* [x] Configure `tauri.conf.json` for borderless, transparent, overlay-ready windowing.
* [x] Build basic Angular component structure for the drawer and desk surface.

## Phase 2: Physics & Canvas Engine Integration
* [ ] Inject **Matter.js** via `PhysicsService`.
* [ ] Map file drop coordinates into physics body creations inside `<app-canvas>`.
* [ ] Implement "Slam Physics" to make desk-surface items (mug/plant) react to drawer close velocity.

## Phase 3: Drag-and-Drop & File System Bridge
* [ ] Implement native OS drag-and-drop event listening via Tauri.
* [ ] Configure file storage logic (moving dropped items to `.junk_drawer` storage folder).
* [ ] Add double-click restore/launch functionality for stashed files.

## Phase 4: Comedic Touches, Audio & Polish
* [ ] Integrate velocity-aware sound effects in `AudioService`.
* [ ] Implement drawer jamming mechanism when overcrowded.
* [ ] Add tangled cables, dust bunnies, and un-deletable rogue junk items.
* [ ] Configure global "Emergency Sweep" hotkey.