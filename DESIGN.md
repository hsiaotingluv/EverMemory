---
name: EverMemory · The way home
description: A gentle Jiufen hillside adventure, remembered through places.
colors:
  paper: "#f3eddf"
  ink: "#354338"
  soft: "#626a55"
  rust: "#a24932"
  line: "#cdc9b6"
  rust-hover: "#853c2a"
  button-paper: "#fff9eb"
  field-paper: "rgba(255,253,244,.65)"
  field-border: "#b7b8a5"
  selected-paper: "#e5dcc5"
  round-paper: "#f4ecddeb"
  terracotta: "#b94832"
  ochre: "#cd9545"
  warm-plaster: "#e0bd8b"
  burgundy-timber: "#653a2b"
  lantern-red: "#d83c21"
  window-amber: "#efb762"
  leaf-green: "#65834f"
  sun-amber: "#ffcd86"
  peach-haze: "#e8bf91"
  rose-dusk: "#b79599"
typography:
  display:
    fontFamily: "Memory Serif, Georgia, serif"
    fontSize: "clamp(72px, 7.8vw, 96px)"
    fontWeight: 500
    lineHeight: 0.86
    letterSpacing: "-0.036em"
  headline:
    fontFamily: "Memory Serif, Georgia, serif"
    fontSize: "47px"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.025em"
  place-title:
    fontFamily: "Memory Serif, Georgia, serif"
    fontSize: "34px"
    fontWeight: 500
    lineHeight: 1.1
  memory-body:
    fontFamily: "Memory Serif, Georgia, serif"
    fontSize: "23px"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Memory Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.7
  action:
    fontFamily: "Memory Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.025em"
  field-label:
    fontFamily: "Memory Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 500
rounded:
  field: "4px"
  action: "5px"
  interaction: "6px"
  paper: "9px"
  circular: "50%"
spacing:
  compact: "10px"
  related: "12px"
  group: "18px"
  section: "24px"
  paper-inset: "42px"
components:
  button-primary:
    backgroundColor: "{colors.rust}"
    textColor: "{colors.button-paper}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    padding: "14px 20px"
  button-primary-hover:
    backgroundColor: "{colors.rust-hover}"
  button-text:
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    padding: "10px 0"
  field-name:
    backgroundColor: "{colors.field-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "13px 12px"
  button-round:
    backgroundColor: "{colors.round-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.circular}"
    size: "43px"
  paper-dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    padding: "42px"
    width: "520px"
  character-option:
    textColor: "{colors.ink}"
    rounded: "{rounded.action}"
    padding: "8px 11px"
  character-option-selected:
    backgroundColor: "{colors.selected-paper}"
---

# Design System: EverMemory

## Overview

**Creative North Star: "The way home"**

The way home pairs a living hillside with the quiet material of a kept letter. Jiufen's steep stone lanes, stacked tea houses, Traditional Chinese signs, red lanterns and distant mountain ridges establish the place. Warm, vibrant architecture carries the scene; ivory paper and small ink controls give the traveller room to explore.

The confirmed visual authority is the user's Jiufen moodboard and Sakura Peak reference, implemented directly in Three.js. There is no approved generated design comp. Geometry, weathered canvas textures, signs, SVG icons and ambient audio are authored in code. The current world is a finite, compressed neighbourhood with six fictional memories and an intentionally generic placeholder character. These are prototype constraints, not claims of geographic completeness or a finished character-art system.

**Key Characteristics:**

- Warm terracotta, ochre and plaster façades framed by burgundy timber.
- Amber light, peach haze and rose-toned dusk; green concentrated in foliage.
- Expressive serif titles, readable serif memory passages and restrained sans-serif controls.
- Full-viewport exploration with quiet edge controls and layered paper dialogs.
- Original line icons and a recurring petal-shaped memory marker.

## Colors

The palette balances sun-warmed building pigments with ivory paper, deep botanical ink and a cooler green landscape. Frontmatter values are extracted from `src/style.css` and `src/world.js`; world colours are material or light inputs, so rendered appearance also depends on texture, lighting and tone mapping.

### Primary

- **Rust:** primary actions, title emphasis, focus outlines and the identity mark.
- **Terracotta, ochre and warm plaster:** complementary façades across the main streets, retaining variety at a distance.

### Secondary

- **Burgundy timber:** structural beams, balconies and lantern supports. It gives bright plaster and glowing windows a dark frame.
- **Lantern red and window amber:** the town's points of warmth, strengthened by emission as dusk advances.
- **Sun amber, peach haze and rose dusk:** light and depth across the day-to-dusk transition. These are scene roles, not UI surface fills.

### Tertiary

- **Leaf green:** the canopy and planted details. Distant ridges and the sea use quieter cool tones to separate depth from the warm foreground.

### Neutral

- **Paper:** dialog ground and light HUD text.
- **Ink:** titles, controls and readable marks on paper.
- **Soft:** secondary prose, field notes and metadata on paper.
- **Line:** dividers between journal entries and grouped settings.
- **Button paper, field paper and round paper:** purpose-specific light surfaces already used by controls; retain their current opacity where the world shows through.

**The Warm Town Rule.** Keep architecture warm and distinct from vegetation. Green belongs chiefly to foliage, distant ridges and quiet ink.

## Typography

**Display Font:** Cormorant Garamond, self-hosted under the CSS family `Memory Serif`, with Georgia and serif fallbacks.

**Body Font:** DM Sans, self-hosted under `Memory Sans`, with a sans-serif fallback. Both font families have local SIL Open Font Licence files under `public/fonts/`.

The serif carries recollection and narrative; the sans-serif carries instructions. Italic rust words add a human cadence within otherwise restrained titles. Traditional Chinese place signs use the existing system serif rendering.

- **Display:** the large title uses the frontmatter clamp. Mobile uses (77px) at a line height of (0.88); the compact desktop-height rule uses (83px).
- **Headline:** paper-dialog titles use the headline role. Onboarding has its own larger heading (51px), and memory titles use (37px), both reduced at the mobile breakpoint.
- **Place title:** the HUD title uses the place-title role and drops to (28px) on mobile.
- **Memory body:** narrative passages retain (23px) with a line height of (1.45) on desktop and mobile. Do not apply the much smaller utility-copy scale to these passages.
- **Utility body and labels:** sans-serif copy varies with purpose: paper-dialog body (12px), field labels (11px), and compact HUD metadata (9–11px). These compact values describe the current game overlay, not a universal body-text rule for future surfaces.

**The Title First Rule.** Keep the title first in reading order. On the welcome screen, group the Jiufen stamp beside the title at its upper right with a 24px gap and 8px optical top offset, as requested in the browser comment. The stamp stays hidden below 700px. Place HUD and memory dialog location metadata remain below their headings.

## Layout

The app is a fixed, full-viewport canvas with DOM overlays. It has no scrolling marketing-page grid. The welcome and onboarding occupy the left at (8%) on desktop, increasing to (10%) from (1600px); the view of the tea houses remains open to the right. During play, location and quest sit at the upper left, circular tools at the upper right, and progress and compass near the lower corners.

The primary responsive boundary is (700px). Below it, welcome copy moves towards the bottom with (28px) left clearance and a bottom-up paper gradient. Onboarding becomes a constrained fluid column. The keyboard guide disappears and thumb controls occupy the lower corners with safe-area-aware placement. Coarse pointers above this width also receive touch controls.

Paper dialogs are bounded by `calc(100dvh - 48px)`. The standard desktop dialog is (520px) wide; the map is (630px). The memory dialog is (750px), with a (260px) illustration column. On mobile, dialog width becomes `calc(100vw - 30px)` and the memory layout stacks above the reading area. Its art panel is (130px) tall, with a horizontal caption near the lower left and an illustration raised slightly above it.

Spacing follows the existing local rhythm rather than a single rigid grid: compact controls use roughly (10–14px), grouped content uses (18–26px), and paper-dialog insets use (42px) on desktop and (35px 27px) on mobile.

## Elevation & Depth

The town creates depth through real geometry, staggered building heights, shadows, distant ridgelines, fog and warm emissive windows. Procedural weathering gives rough materials a painted surface. The UI uses a hybrid: flat paper and hairline divisions for content, with diffuse shadows and a blurred dark backdrop to lift active dialogs away from the world.

- **Paper dialog:** `0 24px 90px #14282044`, with a backdrop of `#24392c73` and (5px) blur.
- **Nearby memory prompt:** `0 10px 28px #1b322830`, enough separation for an actionable object above the street.
- **World labels:** restrained dark text shadows preserve light lettering against scenery. Do not transfer those text shadows to paper dialogs.

**The World First Rule.** Use paper and shadow to make an active task readable while preserving a clear view of the town. Keep exploration controls at the edges.

Dialogs enter over (0.45s) from a (14px) downward offset using the shared ease. Buttons lift by (2px) on hover. Ambient motion is slow and small: drifting motes, bobbing memory beacons and subtle character movement. Respect both the reduced-motion setting and the OS preference; decorative scene movement must remain suppressible.

## Shapes

Paper rectangles have gentle, small corners rather than pill silhouettes: fields (4px), actions (5px), interaction prompts (6px), dialogs (9px). Circular controls belong to compact tools, sound and touch input. Journal entries remain unboxed rows divided by a fine line.

The memory motif is a rotated, petal-like outline with one sharper corner. It recurs in the quest and six progress marks; a found memory fills with warm gold. Line icons remain small, clean and unfilled. General action icons use a (1.5) stroke with rounded line ends; their visible sizes are typically (14–20px), with larger artwork reserved for memory and journal illustrations.

Architecture uses stepped massing, tiled roofs with lifted edges, layered timber rails, lantern ribs and dense utility cables. These recognisable local silhouettes matter more than adding unrelated decorative detail.

## Components

### Buttons

Quiet and legible, with a single rust primary action. Preserve its left-aligned label, trailing SVG arrow and modest corners. The default minimum height is (51px); smaller memory-dialog actions are an established compact variant. Hover darkens rust and lifts the control. Text actions use an understated underline and rust on hover. Keyboard focus uses a (2px) rust outline with (5px) offset. Disabled buttons lower opacity and reflect their current state.

### Character fields

The name field is pale and slightly translucent with a fine warm-grey border. Character options are adjacent selectable panels with small CSS portraits and radio markers. Selection uses a darker paper fill and rust border; focus remains visible around the option. These portraits reflect the generic character choice, not a complete portrait illustration system.

### Navigation and world controls

The serif wordmark and original house-like SVG mark anchor the top edge. Journal, map and settings use circular paper buttons, consistent ink icons and accessible names. On desktop, small adjacent labels support recognition; on mobile they disappear to preserve space. Keep these controls distinct from the lower thumb joystick and touch interaction action.

### Paper dialogs

A serif heading leads, followed by supporting copy and task content. Close uses the same SVG cross as the control-guide dismiss action. Preserve the shared paper ground, small corners and soft modal backdrop. Long content must scroll within the available viewport.

### Memory reveal

A two-part keepsake: original line illustration on a coloured art panel, then title, place, serif narrative and a small next action. Mobile stacks these parts and keeps the art caption horizontal. The six fictional memories form the journal; collection changes progress markers and eventually reveals a quiet ending, while exploration remains available.

### Journal entries

A line icon, serif memory title and small sans-serif place note form an open row. A single fine divider separates entries. Locked rows are visually subdued; remembered entries invite revisiting. The journal can be saved as a letter, matching the kept-paper metaphor.

### Nearby memory prompt

A light paper prompt appears when a memory is close. It combines a compact contextual label, the object name, a trailing SVG arrow and a desktop keycap. On mobile the keycap is hidden and the touch action remains available. Keep it clear of thumb controls.

## Do's and Don'ts

### Do:

- **Do** preserve Jiufen's hillside identity through stairs, dense tea houses, lanterns, Traditional Chinese place signs and mountain depth.
- **Do** keep the town warm and vibrant, with burgundy structure and amber windows supporting terracotta, ochre and plaster.
- **Do** use the existing serif/sans pairing and title-before-location hierarchy.
- **Do** use original inline SVG line icons with visible focus states and accessible action names.
- **Do** check desktop and touch layouts, especially memory captions, dialog scrolling and joystick clearance.
- **Do** describe the world as an imagined, compressed neighbourhood and its six memories as fictional.

### Don't:

- **Don't** turn the architecture uniformly green or let haze erase the warm colour differences.
- **Don't** introduce a torii or other place-defining motif that replaces Jiufen's ordinary street sign and timber-post gateway.
- **Don't** replace the working 3D environment with a flat reference image or imply that a generated comp was approved.
- **Don't** mix platform-dependent text glyphs into the established SVG action-icon system.
- **Don't** rotate mobile memory-art captions into vertical text or place them across the central illustration.
- **Don't** present the generic character or finite neighbourhood as a completed production art scope.
