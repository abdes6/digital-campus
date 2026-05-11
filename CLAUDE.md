# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Three.js computer graphics midterm exam project. The working project is in `three.js/project/`.

## Running the Project

HTML files use ES6 import maps and **must be served over HTTP** — `file://` will fail due to CORS on module imports.

```bash
python -m http.server 8080
# then open http://localhost:8080/three.js/project/index.html
```

Three.js library commands (from `three.js/three.js-r179/`):
```bash
npm start       # dev server
npm run build   # production build
npm run lint    # ESLint
npm test        # test suite
```

## Architecture

**Entry point:** `three.js/project/index.html` — bare HTML with an import map, loads `index.js` as an ES module.

**Import map** (in each HTML file):
- `three` → `/three.js-r179/build/three.module.js`
- `three/addons/` → `/three.js-r179/examples/jsm/`
- `@tweenjs/tween.js` → `/tween.js/dist/tween.esm.js`

**`index.js` scene structure:**
- Scene, PerspectiveCamera, WebGLRenderer (antialias)
- Geometry: plane (floor), cube (MeshPhong), sphere (MeshStandard), cylinder (MeshPhong, transparent)
- Lighting: AmbientLight + SpotLight (shadow-casting) + PointLight
- OrbitControls with damping
- Animation loop: cube rotates, sphere oscillates on X, cylinder scales on Y
- Window resize listener updates camera aspect + renderer size
