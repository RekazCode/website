# Rekaz (ركاز) – The Intelligent Architecture

A futuristic single-page concept site for an AI tech company, featuring glassmorphism, subtle scroll animations, an abstract rotating crystal, and an interactive showcase modal system.

## Features
- Hero with animated pseudo-3D crystal (Canvas 2D) symbolizing adaptive architecture
- Glassmorphism navigation, service cards, modal & form surfaces
- Scroll-triggered fade & elevate animations via IntersectionObserver
- Dynamic project showcase grid with quick-view modal
- Accessible focus states & keyboard interaction for projects (Enter to open)
- Contact form with client-side validation & simulated async send
- Theme toggle (light/dark base) persisted in localStorage

## Tech Stack
Pure HTML + CSS + Vanilla JavaScript (no build step). Tajawal font via Google Fonts.

## File Structure
```
assets/
  css/styles.css
  js/app.js
  img/ (placeholder for images)
  icons/ (placeholder for SVGs/icons)
index.html
README.md
```

## Running
Just open `index.html` in a modern browser. For best results with module caching & local fonts, serve with a lightweight static server:

### Windows PowerShell (Python quick server)
```powershell
python -m http.server 8080
```
Then visit http://localhost:8080

## Customization
- Update color system in `:root` of `styles.css`.
- Add real project thumbnails or background images by extending `.project` elements.
- Replace pseudo-3D crystal with a WebGL scene (e.g., Three.js) if heavier visuals desired.

## Accessibility
- Semantic landmarks (header, nav, sections, footer)
- Keyboard operable project cards + Escape to close modal
- Form labels & status region
- Respects `prefers-reduced-motion`

## Roadmap Ideas
- Add internationalization toggle (EN / AR full layout)
- Replace Canvas crystal with GPU shader swirl
- Integrate backend form submission endpoint
- Animate service icons with Lottie or SVG paths

---
© Rekaz (ركاز)
