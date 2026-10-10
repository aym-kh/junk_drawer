# Project Plan: Junk Drawer

## Project Overview

**Junk Drawer** is a fun, utility-driven desktop application for macOS and Windows built with **Angular** and **Tauri v2**. Inspired by UI physics experiments (like the "desktop rug"), Junk Drawer allows users to physically drag desktop icons into an animated, interactive desk drawer to keep their desktop clean without actually deleting anything.

## Core Features & Concepts

1. **Interactive Desktop Drawer Widget**
   * Sits on top of or near the wallpaper level with a transparent, borderless UI.
   * Smooth slide-open / slide-shut animations with interactive handles.
   * **Desk Surface Clutter:** Place virtual desktop objects *on top* of the drawer (coffee mug, desk plant, rubber duck).

2. **Physics-Based File Stashing & "Slam Physics"**
   * Dropping desktop icons into the drawer generates physics bodies (via Matter.js).
   * Icons tumble, bump into each other, and pile up inside the drawer.
   * **Velocity Slam:** Closing the drawer roughly causes desk surface items to tip over, drop leaves, or spill pixel-coffee.
   * **Overstuffed Jam:** If too many files are stashed inside, the drawer jams 80% shut and requires mouse-wiggling to force close.

3. **Tactile & Dynamic Sound FX**
   * Velocity-based Web Audio effects: gentle wooden glides on slow moves, sharp clacks, and loud crashes on fast slams with subtle desktop screen shake.
   * Muffled rustling sounds when moving files around inside the drawer.

4. **Junk Drawer Search, Hazards & Easter Eggs**
   * **Search Bar:** Quickly locate original files inside the clutter.
   * **Tangled Cables:** Randomly spawning charging wires that entangle multiple file icons, requiring unravelling before files can be opened.
   * **Rogue Junk Items:** Un-deletable pixel clutter (loose AAA batteries, paperclips, dried markers).
   * **Dust Bunnies:** Files left untouched for over 7 days collect dust bunnies that poof when clicked.

5. **Real File Handling vs. Virtual Storage**
   * **Mode A (Actual Move):** Files dropped into the drawer move to a hidden `.junk_drawer` folder.
   * **Mode B (Alias / Hide):** Files remain in place, but app controls desktop icon visibility via system shell commands.
   * **Emergency Sweep Shortcut:** Global hotkey (`Cmd+Shift+J` / `Ctrl+Shift+J`) instantly sweeps all desktop items into the drawer.