# Asset provenance

All 3D models, custom geometry, procedural canvas paint/sign textures, interface line icons, favicon and synthesised audio are authored in the source files in this project. No external photograph ships in the game. Three original Blender-rendered WebM films are included.

## Fonts

- Cormorant Garamond, 500 normal: https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_s06GnM.ttf
- Cormorant Garamond, 400 italic: https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd58jDOjw.ttf
- DM Sans, 400 normal: https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf

Retrieved 13 September 2026. The fonts are stored in `public/fonts/` and embedded in the standalone export. SIL Open Font License texts accompany the local copies.

## Moodboard

The 14 attached images and https://www.youtube.com/watch?v=CnzCwBJDI_A were studied as references. They are not copied into the shipped HTML. Japanese imagery in Sakura Peak informs atmosphere rather than literal Taiwanese landmarks.

## Blender models and memory films

`assets/blender/jiufen-refinements.blend` is the editable source for the female traveller, Rainlight Teahouse and Kongming lantern. `build_refinements.py` and `reference_details.py` author the models; `render_memories.py` authors the three eight-second, 640 × 360, 12 fps WebM memory films. The browser uses `public/models/jiufen-refinements.glb` and `public/memories/{rain,lanterns,mooncake}.webm`. The standalone HTML embeds these assets.

The traveller has long hair, a fitted ivory blouse, a mauve skirt, boots and a backpack. The teahouse references the user's four additional photographs through its warm timber lattice, shelves of ceramic jars, kettle counter, tea packets and lantern exterior. Those photographs are reference material only and are not included in the shipped assets. All meshes and film scenes were authored specifically in Blender for this project; no third-party character, teahouse or film model was downloaded.

The memory films show a family tea setting, a lantern-lined window walk and a mooncake between two cups. They are fictional symbolic childhood memories. QA screenshots and rendered stills in `outputs/qa/` are verification evidence, not runtime assets.
