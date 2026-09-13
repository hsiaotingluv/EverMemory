# Developer guide

[Back to EverMemory](../README.md)

## Run locally

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4173/ . The preview is bound to the local machine. Source and downloadable files are hosted on GitHub; a public game website has not been deployed.

## Play

Name your character and choose male or female, then enter the town. On desktop, WASD or the arrow keys walk, Shift runs, dragging looks around, the mouse wheel zooms and E interacts with a nearby object. J opens the journal, M the map and Escape pauses.

On mobile, the left thumb control moves the character. Drag the world to look, and use the memory button when close to an object. Choosing a numbered map stop, or tapping a walkable path on the map, starts a walk along the connected lanes; manual movement takes over immediately.

Read all three pages of a memory and select **Keep this memory** to add it to the journal. Progress and position save to this browser. **Continue your journey** resumes it. **Begin your journey** creates a new character and replaces the current browser save when the character form is submitted.

The HUD opens with a six-stop story walk designed for a smooth live presentation: bus-ticket memory, blue cup, first lantern riddle, Rainlight Teahouse, first tea memory and the wishing terrace. The neighbourhood map draws the same route as a restrained rust line. After the lantern release, the journal holds the recovered memory and wish.

Ambient sound starts only when enabled. Settings offer time of day, visual detail and reduced motion. The journal can be downloaded as a text letter.

## The western ridge and wishing terrace

Level side paths connect the main stairway landings to the street doors. Follow the western ridge into **Rainlight Teahouse**, an original Blender-built room with timber cabinetry, ceramic jars, a kettle counter and a tea table. Its roof lifts out of the camera view indoors. The other street buildings remain exterior destinations.

Find a reusable cup and solve lantern riddles to earn coins. Your first tea is a free four-step brewing puzzle. Two further teas cost 10 coins each; completed tea memories replay freely. Each new tasting restores 20 energy and unlocks an original eight-second memory film and one mooncake. A mooncake restores 40 energy. Walking uses energy; low energy slows the traveller but never prevents exploration. The pouch, tasting stage and film progress save locally. See [MINIGAMES.md](../MINIGAMES.md) for the rules and persistence contract.

At the **wishing terrace**, write a wish and release a Kongming lantern. A procession of 360 lanterns follows into the dusk sky. Wishes join the journal. The camera sequence can be left immediately, and reduced motion keeps the player's camera under their control.

## Build and verify

```sh
npm test
npm run build
```

The build produces the static app in `dist/` and a self-contained `outputs/evermemory.html` (about 8.3 MiB, including Three.js, fonts, the Blender models and three memory films). The standalone file includes everything needed to render; WebGL must be available in the browser. Browser save behaviour for `file://` URLs depends on the browser, so localhost is recommended for reliable persistence.

Thirty-seven tests cover navigation, the six-stop story walk, level entrance paths, interior access and furniture boundaries, wish validation, original memories, tea and riddle rules, energy, rewards and resumable saves. Browser checks exercise the title, exploration, tea brewing, film playback, payment recovery and desktop/mobile layouts.

## Project structure

- `src/world.js`: original procedural architecture, terrain, sky, foliage, lanterns, character and lighting.
- `src/story.js`: six memories, world footprint, terrain heights, navigation and save validation.
- `src/main.js`: state transitions, third-person camera, input, interaction, journal, map and persistence.
- `src/style.css` and `src/minigames.css`: paper-coloured interface and desktop/mobile layouts.
- `src/refinements.js`: Blender asset integration, female animation, teahouse cutaway and lantern procession.
- `src/minigame-ui.js`, `src/minigame-world.js`, `src/tea-brewing.js`: tea and riddle interactions, collectible props and animated brewing.
- `src/minigames.js`, `src/journey-store.js`: pure game rules and browser-save integration.
- `assets/blender/`: editable `.blend` file and reproducible modelling and film scripts.
- `src/audio.js`: original synthesised wind and pentatonic wind chimes.
- `scripts/standalone.mjs`: embeds the production bundle, fonts, models and films into one HTML file.

## Art direction and limits

The neighbourhood interprets Jiufen's hillside density, Traditional Chinese signs, timber tea houses, red lanterns and stairways. It is a finite connected exploration world, not a geographically accurate reproduction. The story, character and environmental models are original placeholders. Rainlight Teahouse has one enterable room; other buildings provide exterior exploration. There are no crowds or combat. The three tea films are silent, stylised symbolic scenes rather than acted cinematic sequences. No accounts, cloud sync or backend are involved.

The user's Jiufen photos, maps and Sakura Peak screenshots were used as visual references, not embedded assets. The supplied video was viewed for mood and traversal: https://www.youtube.com/watch?v=CnzCwBJDI_A .

## Dependencies and local skills

Three.js (MIT) and Vite (MIT). Cormorant Garamond and DM Sans are self-hosted from Google Fonts and licensed under the SIL Open Font License. Geometry, procedural textures, sound and line icons are authored in this project.

At the user's request, three skills were found through skills.sh and installed project-locally from https://github.com/CloudAI-X/threejs-skills : `threejs-geometry`, `threejs-lighting`, `threejs-interaction`. No paid service or additional account was needed.

## Release files

[Download the original 4K demo](https://github.com/hsiaotingluv/EverMemory/releases/download/hackathon-demo-2026-09-13/gpt6.mp4) · [Download the playable HTML](https://github.com/hsiaotingluv/EverMemory/releases/download/hackathon-demo-2026-09-13/evermemory.html) · [Hackathon release](https://github.com/hsiaotingluv/EverMemory/releases/tag/hackathon-demo-2026-09-13)

The 111.3-second demo is a release asset because it exceeds GitHub's regular Git file limit. Its format and checksum are recorded in [demo/manifest.json](../demo/manifest.json).
