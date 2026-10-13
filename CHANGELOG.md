# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0-beta.4] - 2026-10-11
- Enhanced drawer UI (3D-ish)
- Fixed hotkey registration
- fixed drawer floor overflow so items can't slide to the abyss
- Changed tauri icons

## [0.1.0-beta.3] - 2026-10-11
- Slam physics / desk clutter micro-interactions
- Sound effects for dropping, sliding, and slamming
- Visual polish (drop shadows and custom file icons)

## [0.1.0] - 2026-10-10

### Added
- Tauri v2 + Angular standalone architecture with frameless transparent window.
- Matter.js physics engine integration for gravity, collisions, and stacking.
- Native desktop drag-and-drop file interception via Tauri window events.
- Local secure filesystem storage in hidden `AppData` backed by `junk_manifest.json`.
- State persistence allowing stashed files to respawn into the physics drawer on app restart.
- Double-click file restore functionality to safely eject items back onto the desktop.