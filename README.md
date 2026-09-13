# The way home

A local Three.js adventure through an imagined Jiufen. A returning traveller recovers six fictional childhood memories through family, food and familiar places.

## Run locally

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4173/ . The preview is bound to the local machine. This project has not been published.

## Play

Name your character and choose male or female, then enter the town. On desktop, WASD or the arrow keys walk, Shift runs, dragging looks around, the mouse wheel zooms and E opens a nearby memory. J opens the journal, M the map and Escape pauses.

On mobile, the left thumb control moves the character. Drag the world to look, and use the memory button when close to an object. Choosing a numbered map stop starts a walk along the lanes; manual movement takes over immediately.

Read all three pages of a memory and select **Keep this memory** to add it to the journal. Progress and position save to this browser. **Continue your journey** resumes it. **Begin your journey** creates a new character and replaces the current browser save when the character form is submitted.

Ambient sound starts only when enabled. Settings offer time of day, visual detail and reduced motion. The journal can be downloaded as a text letter.

## Build and verify

```sh
npm test
npm run build
```

The build produces the static app in `dist/` and a self-contained `outputs/evermemory.html` (about 1.4 MB, including Three.js and fonts). The standalone file includes everything needed to render; WebGL must be available in the browser. Browser save behaviour for `file://` URLs depends on the browser, so localhost is recommended for reliable persistence.

Six tests cover route connectivity and memory reachability, stair continuity, world boundaries and proximity, save validation, story completeness and guided walking. Browser QA covers title/onboarding, exploration, memory collection, journal unlock, persistence and responsive layouts.

## Project structure

- `src/world.js`: original procedural architecture, terrain, sky, foliage, lanterns, character and lighting.
- `src/story.js`: six memories, world footprint, terrain heights, navigation and save validation.
- `src/main.js`: state transitions, third-person camera, input, interaction, journal, map and persistence.
- `src/style.css`: paper-coloured interface and desktop/mobile layouts.
- `src/audio.js`: original synthesised wind and pentatonic wind chimes.
- `scripts/standalone.mjs`: embeds the production bundle and fonts into one HTML file.

## Art direction and limits

The neighbourhood interprets Jiufen's hillside density, Traditional Chinese signs, timber tea houses, red lanterns and stairways. It is a finite connected exploration world, not a geographically accurate reproduction. The story, character and environmental models are original placeholders. Buildings currently provide exterior exploration; there are no enterable interiors, crowds or combat. No accounts, cloud sync or backend are involved.

The user's Jiufen photos, maps and Sakura Peak screenshots were used as visual references, not embedded assets. The supplied video was viewed for mood and traversal: https://www.youtube.com/watch?v=CnzCwBJDI_A .

## Dependencies and local skills

Three.js (MIT) and Vite (MIT). Cormorant Garamond and DM Sans are self-hosted from Google Fonts and licensed under the SIL Open Font License. Geometry, procedural textures, sound and line icons are authored in this project.

At the user's request, three skills were found through skills.sh and installed project-locally from https://github.com/CloudAI-X/threejs-skills : `threejs-geometry`, `threejs-lighting`, `threejs-interaction`. No paid service or additional account was needed.
