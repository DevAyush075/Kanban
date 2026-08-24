# Kanban.ai — UI Engineering & Architecture Guide

This document provides a detailed technical walkthrough of how the user interface (UI) and visual user experience (UX) were designed, engineered, and implemented for **kanman.ai**.

---

## 🛠️ 1. Technical Stack Overview

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14 (App Router)** | Server & Client component rendering, route management, performance |
| **Language** | **TypeScript** | Type-safe components, props, state, and WebGL references |
| **3D Engine** | **Three.js** | WebGL interactive 3D retro robot mascot with real-time lighting & mouse tracking |
| **Styling & Design System** | **Tailwind CSS + Custom CSS Variables** | Utility-first styling, color tokens, custom keyframe animations |
| **Typography** | **Google Fonts (`Space Grotesk`, `Plus Jakarta Sans`)** | Tech display headings and modern legible body typography |
| **Iconography** | **Lucide React** | Scalable, clean UI icons |

---

## 🎨 2. Design System & Aesthetics

### Color Palette & Visual Tokens
The application relies on a dark retro-cyberpunk aesthetic built on standard CSS variables defined in [`src/app/globals.css`](file:///c:/Users/Ayush/Desktop/kanban/src/app/globals.css):

```css
:root {
  --background: #030a0d;       /* Deep Obsidian Base */
  --background-alt: #051419;   /* Secondary Dark Teal Background */
  --teal-dark: #072229;        /* Dark Teal Container Accent */
  --teal-glow: #0d4652;        /* Glowing Teal Ambient Shadow */
  --cyan-bright: #2dd4bf;      /* High-contrast Cyan Highlight */
  --cyan-accent: #06b6d4;      /* Electric Cyan Accent */
  --yellow-glow: #fbbf24;      /* Gold/Yellow Glow Accent */
  --yellow-accent: #ffd700;    /* Sunburst Yellow Accent */
  --foreground: #f0fdfa;       /* Soft White Text */
  --foreground-muted: #94a3b8; /* Muted Slate Text */
  --card-bg: rgba(7, 30, 36, 0.7);
  --card-border: rgba(45, 212, 191, 0.15);
}
```

### Key Aesthetic Features
1. **Glassmorphism Panels**: Blur backdrops created with `.glass-panel` and `.glass-pill` classes using `backdrop-filter: blur(16px)`.
2. **Radial Backdrop Glows**: Layered radial gradients applied to `body` and section containers to simulate glowing ambient light spots.
3. **Paint Stroke Highlight Badge**: In the Hero section, a yellow badge rotated slightly (`transform: -rotate-1`) with SVG/CSS paint drips provides immediate visual contrast against dark backgrounds.
4. **Neon Glow Utilities**: Custom `.glow-text-yellow`, `.glow-text-cyan`, `.glow-box-yellow`, and `.glow-box-cyan` text and box shadow effects.

---

## 🤖 3. Interactive 3D Robot Mascot ([`RobotMascot3D.tsx`](file:///c:/Users/Ayush/Desktop/kanban/src/components/landing/RobotMascot3D.tsx))

The standout UI component is an interactive 3D WebGL robot mascot rendered directly into a HTML Canvas using Three.js.

### How It Was Built:
- **Scene, Camera, Renderer Setup**:
  - `THREE.PerspectiveCamera(45, width / height, 0.1, 1000)` configured with alpha transparency enabled on `THREE.WebGLRenderer`.
- **Material Engineering**:
  - **Brass Body**: `THREE.MeshStandardMaterial` with `color: 0xc59b27`, `metalness: 0.85`, and `roughness: 0.35`.
  - **Teal Cape**: `THREE.MeshStandardMaterial` with `side: THREE.DoubleSide` and cloth roughness (`0.85`).
  - **Glass Visor**: Semi-transparent sphere helmet with physical specular highlights.
- **Lighting Dynamics**:
  - Dual directional lights: Warm gold key light (`0xffd700`, intensity `2.0`) and Teal rim light (`0x2dd4bf`, intensity `3.0`).
  - Point light at the robot base (`antiGravityLight`) casting an energetic teal glow downwards.
- **Animation & Physics**:
  1. **Floating Levitation**: A `requestAnimationFrame` loop mutates the Y position of `robotGroupRef` using `Math.sin(time * 2) * 0.15`.
  2. **Mouse Tracking**: Mouse position event listeners convert viewport `(x, y)` to normalized device coordinates, subtly rotating the robot head and body toward the user's cursor:
     ```typescript
     robotGroupRef.current.rotation.y = THREE.MathUtils.lerp(
       robotGroupRef.current.rotation.y,
       mousePos.current.x * 0.4,
       0.05
     );
     ```
  3. **State Switching**: Transitions between `'default'`, `'interaction'` (hover state), and `'contextual'` (active AI task working mode with intensified lighting and faster floating).
- **Resource Management**: Complete cleanup routine in `useEffect` disposing geometries, materials, and cancelling animation loops on component unmount.

---

## 📊 4. Interactive Live Demo Workspace ([`AppDemoWorkspace.tsx`](file:///c:/Users/Ayush/Desktop/kanban/src/components/landing/AppDemoWorkspace.tsx))

The demo workspace provides a dual-column simulation showcasing live AI chat on the left and an animated Kanban board on the right.

### Highlights & Implementation:
1. **Automated Drag & Drop Keyframe Animation**:
   Custom CSS keyframes in [`src/app/globals.css`](file:///c:/Users/Ayush/Desktop/kanban/src/app/globals.css) power an automated cursor dragging a Kanban task card from *Backlog* to *Ready*:
   - `@keyframes dragCursorPath`: Moves the cursor icon along specified X/Y coordinates.
   - `@keyframes draggedCardPath`: Rotates, scales, and translates the active task card with elevated shadows (`box-shadow: 0 15px 35px rgba(45, 212, 191, 0.4)`).
   - `@keyframes columnPulse`: Highlights the destination column when the card arrives.
2. **Interactive AI Chat Simulator**:
   - Allows users to enter prompt strings into the chat bar.
   - Simulates AI typing indicators (`isAiTyping`) and automatically generates a new task on the Kanban board after a `1200ms` delay.
3. **Playback Controls**:
   - Users can pause, play, or trigger test task creation using interactive controls in the demo header bar.

---

## 🧩 5. Component Breakdown & Structure

```
src/
├── app/
│   ├── globals.css          # CSS Variables, Keyframe Animations, Utilities
│   ├── layout.tsx           # Main Root Layout with Font Configurations
│   └── page.tsx             # Master Landing Page Composition
└── components/
    ├── landing/
    │   ├── Header.tsx       # Glassmorphism Sticky Navbar & Mobile Drawer
    │   ├── HeroSection.tsx  # Headline, Paint Badge, CTA Form & 3D Robot Mount
    │   ├── RobotMascot3D.tsx# WebGL Three.js Robot Mascot Implementation
    │   ├── ScrollPrompt.tsx # Micro-animated Mouse Scroll Indicator
    │   ├── AppDemoWorkspace.tsx # Interactive AI & Kanban Board Simulator
    │   ├── FeaturesSection.tsx # Feature Highlights Cards with Glowing Icons
    │   ├── PricingSection.tsx  # Tiered Pricing Matrix & Billing Toggle
    │   ├── FaqSection.tsx   # Interactive Accordions for FAQs
    │   └── Footer.tsx       # Multi-column Footer & System Status Badge
    └── ui/
        └── button.tsx       # Reusable Styled Button Component
```

---

## 🚀 6. Performance & UX Best Practices Applied

- **Client vs. Server Components**: Used `'use client'` strictly on interactive components (`RobotMascot3D`, `AppDemoWorkspace`, `Header`, etc.) while keeping layout structure clean.
- **Hardware Acceleration**: 3D rendering uses WebGL hardware acceleration; CSS animations utilize `transform` and `opacity` properties to trigger GPU composition rather than layout reflows.
- **Responsive Layout**: Designed mobile-first using Tailwind's responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`), adapting the complex 3D mascot and dual-column layouts seamlessly for smaller screens.
- **Accessible & Dynamic Contrast**: High contrast colors (`#030a0d` obsidian background paired with `#f0fdfa` soft white and `#2dd4bf` cyan) maintain high legibility across screens.

---

*Document generated for project **kanman.ai**.*
