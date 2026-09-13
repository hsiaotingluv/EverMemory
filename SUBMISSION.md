# EverMemory: project and submission evidence

> What if memory had streets, lanterns, rain, and tea?

EverMemory is a playable Three.js interpretation of a childhood family visit to Jiufen, Taiwan. Exploration leads to lantern riddles, a hidden teahouse, tea-triggered flashbacks, and a wish released into the sky. The creator grew up in Taiwan and visited Jiufen with family; Jiufen itself still exists. The project explores returning to the remembered version of a place and a moment in life.

The broader vision is to combine old photographs with remembered details to create walkable memory worlds. This prototype is one authored interpretation. It does not currently offer an automatic photo-upload-to-3D reconstruction pipeline. Its in-game family scenes and dialogue are fictional symbolic memories.

The [hackathon release](https://github.com/hsiaotingluv/EverMemory/releases/tag/hackathon-demo-2026-09-13) includes the creator-supplied [final demo video](https://github.com/hsiaotingluv/EverMemory/releases/download/hackathon-demo-2026-09-13/gpt6.mp4) and a downloadable, self-contained game HTML. The original video is 111.3 seconds, 3840 × 2160 at 30 fps, with HEVC video and AAC audio. It is preserved unchanged; its actual duration is longer than the portal's 90-second video requirement.

## Proposed tracks

1. **Best example of Visual Understanding**
2. **Best example of Agentic Engineering**

These are recommendations based on the current project evidence, not official eligibility decisions or a comparative ranking of other entries.

## Visual Understanding: reference details become playable space

The project's [asset provenance](ASSETS.md) and [product brief](PRODUCT.md) document Jiufen photographs, maps, a moodboard, and four teahouse photographs as development references. The photographs are not embedded as runtime backgrounds.

| Reference detail documented by the project | Implementation to inspect | What to observe in the game |
| --- | --- | --- |
| Hillside building density, stairs, lanterns, and Traditional Chinese signs | [world.js](src/world.js), [story.js](src/story.js) | Walk connected lanes, ascend stairs, and move around the architecture |
| Timber lattice, shelving, glazed storage jars, kettle counter, and tea packets | [reference_details.py](assets/blender/reference_details.py), [build_refinements.py](assets/blender/build_refinements.py) | Enter Rainlight Teahouse and inspect its interior from different angles |
| Turning a recognisable tea setting into interaction | [tea-brewing.js](src/tea-brewing.js), [minigame-ui.js](src/minigame-ui.js) | Choose a collected cup, perform the ritual, and watch tea being prepared |

The strongest supporting submission asset would show an actual source photograph beside the corresponding game view, with a brief development excerpt showing the model interpreting that reference. The repository documents the reference relationship; it does not contain the original private reference set or a complete model execution log.

## Agentic Engineering: an integrated, testable game

The engineering case is the development workflow and its working result: reference interpretation, authored geometry and Blender asset scripts, connected navigation, gameplay state transitions, persistence, and validation. The runtime is a static browser game, with no hosted agent service required to play.

| Engineering contribution | Source evidence | Behaviour to verify |
| --- | --- | --- |
| Connected navigation and access to the teahouse | [story.js](src/story.js), [story.test.js](tests/story.test.js) | Reach memory locations and enter/exit the teahouse without crossing furniture |
| Riddles, reusable cups, tea economy, and energy | [minigames.js](src/minigames.js), [minigames.test.js](tests/minigames.test.js) | Wrong answers can be retried; the first tea is free; later teas use coins |
| Resumable media and single rewards | [journey-store.js](src/journey-store.js), [minigame-ui.js](src/minigame-ui.js), [MINIGAMES.md](MINIGAMES.md) | Resume an interrupted tasting without a second charge or reward |
| Model and film authoring | [Blender scripts](assets/blender), [asset provenance](ASSETS.md) | Inspect original models and three authored eight-second symbolic flashbacks |
| Guided presentation and local persistence | [presentation-route.js](src/presentation-route.js), [main.js](src/main.js) | Move from the bus ticket to the wishing terrace; reopen the journal |
| Portable delivery | [standalone.mjs](scripts/standalone.mjs), [package.json](package.json) | Build the static app and self-contained HTML |

For the Astra contribution, include a short, project-specific development excerpt showing a request, the agent's work, and a verified result. The creator identifies Astra as the hackathon development tool. Code and tests alone do not establish the exact model used for every development step.

## Reproduce and explore

Run from the repository root:

```sh
npm install
npm test
npm run dev
```

Open http://127.0.0.1:4173/ on the same machine. To generate a production package, run `npm run build`.

Desktop: WASD/arrows to walk, E to interact, J for the journal, M for the map, Escape for settings. Mobile: movement control and on-screen interaction.

Suggested review route:

1. Begin a journey and recover the folded bus-ticket memory.
2. Collect the blue rain cup.
3. Answer the nearby lantern riddle to earn coins.
4. Descend the stairs and follow the western ridge into Rainlight Teahouse.
5. Read the ritual card and choose a cup and tea. The first tea uses the four-step sequence puzzle.
6. Watch brewing and the flashback. A new tasting restores 20 energy and awards one mooncake; eating it restores up to 40 more.
7. Cross to the wishing terrace, write a wish, and release the lantern.
8. Open the journal. Optional controls include map navigation, ambient sound, time of day, visual detail, and reduced motion.

## Verification snapshot and boundaries

- For the 13 September 2026 hackathon release, `npm test` passed all 37 tests, including the presentation-route tests, and `npm run build` generated the static app and standalone HTML.
- The source audit checked code and automated tests; it did not perform a new full browser playthrough or benchmark. Release smoke checks cover initial loading and the presentation interface.
- This release packages the presentation-route changes, the submission guide, and the rebuilt standalone game. [demo/manifest.json](demo/manifest.json) records the original video checksum for download verification.
- Images, geometry, and film scenes in this repository are authored procedurally or in Blender. No verified GPT-Image-2.5, GPT-Live-1, or Agents API use was found in the inspected source or provenance records.
- A development-time model call need not appear in runtime code; model-specific award claims should be supported by the actual generation or development record.
- The world is an artistic interpretation, with local browser saves. It does not claim historical accuracy or permanent cloud preservation.

Official submission requirements: [hackathon portal](https://astra-hackathon-singapore.openai.chatgpt.site/portal?tab=build). The portal requests a working demo URL, a 90-second video showing the demo and use of Astra, an accessible GitHub repository, and up to two tracks.
