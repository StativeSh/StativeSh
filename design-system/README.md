Studio Ink is a painted, hand-made look for science work on the web: hard black and bone bands, giant condensed titles in flat colours, torn paper panels, red marker notes scribbled over everything, and figures drawn as springy particles you can push with the cursor. It mixes flat 2D ink with real depth, the way a hand-animated film layers drawings over 3D.

## Content fundamentals

- **Voice.** First person, plain and direct, a student who builds things: "I turn physics into things you can play with." Short sentences. No jargon the reader doesn't need, no hype words.
- **Two registers.** Display type is UPPERCASE and declarative (`EXPERIMENTS`, `HI, I'M SHREYAS.`). Marker notes are lowercase asides with personality, often ending in `!`: "that's me!", "all 118 of them!", "runs live in your browser". Never put information the reader needs only in a marker note.
- **Be concrete.** Name the real thing and its real numbers: "covering every element from H to Og", "N = 4,651", "tests that check every solver against known analytic results". Print the actual equation under a figure.
- **Credits, not features.** Describe a project in a credit row (`BUILT WITH`, `FORMAT`, `COVERS`, `STATUS`), then one sentence, then a short list.
- **No emoji.** Use typographic glyphs: `→` on buttons, `↗` on external links, a marker `×` as the list bullet and ring separator.

## Visual foundations

### Colour

- **Two grounds, hard edges.** Pages are a stack of full-width bands: `ink` (dark) and `bone` or ruled bone (light). Switch between them with a hard edge, never a gradient. Text is `bone` on `ink` and `ink` on `bone`.
- **One signal.** `red` is the only loud colour in running UI: marker ink, the button slab, the scroll progress line, list crosses, the first section title. On bone, use `red` only at 24px and up.
- **Title colours.** Give each project its own flat title colour, in order: `tan`, `pink`, `lavender`, `sand`. Use the same colour for that project's credit row. These colours are for display type on `ink` only.
- **Secondary text.** `bone-muted` on ink, `muted-on-bone` on bone. The hero lede uses `lede`; project body copy uses `body-on-panel`.
- **The canvas.** Figures sit on a lit cream canvas: a radial gradient from `canvas-light` through `canvas-mid` to `canvas-dark`, with `canvas-ink` text. Keep small text in the lighter middle; `canvas-muted` and `canvas-accent` lose contrast near `canvas-dark`.
- **No other gradients.** The only gradients are light: the canvas, the warm and cool glows inside panels, the soft light shafts in the top right of dark bands.

### Type

- **Anton** (`display`) for every title, button, nav link, credit and list row, always uppercase. Sizes: `t-mega` for section and project names, `t-hero` for the opening headline, `t-card-title`, `t-statement`, `t-note-title`, `t-credit`, `t-list`, `t-button`, `t-nav`. Set the large ones fluid with `clamp()` as their usage notes say.
- **IBM Plex Sans** (`sans`) for reading: `t-lede`, `t-body`, `t-small`, `t-caption`. Keep body text under about 65 characters wide.
- **IBM Plex Mono** (`mono`) for labels and data: `t-label` (uppercase, letter-spaced), `t-readout`, `t-equation`.
- **Permanent Marker** (`marker`) only for handwriting: `t-hello`, `t-scrawl`, `t-sign`, `t-wordmark`. Always rotated a few degrees.
- **Extrusion.** Display type on `ink` gets a hard `deep` offset (5px 6px on the hero, 6px 8px on titles), never a blur.
- All four faces load from Google Fonts; `components/bundle.css` imports them.

### Layout and spacing

- Content sits in a centred column (`wrap-max`) inside each band, with a fluid side gutter from `gutter-min` to `gutter`.
- Each project block is: a torn panel, its giant title overlapping the panel's bottom edge (`margin-top: -0.52em`), a credit row, then a body row of text, list and actions. Space blocks with `block-y`.
- The straddling title opens a major section: top half on bone, bottom half on ink. Put `section-y` above it.
- Cards and notes go in grids with `gap-lg`; buttons and links in a row with `gap-sm` and `gap-md`.

### Surfaces, borders, shadows, radii

- **Square everything.** `radius-none` on buttons, cards, notes and bands. The only curves are the corners of the torn-edge polygon (`radius-torn` on panels, `radius-torn-sm` on the figure canvas).
- **Hard offset shadows only**, never blurred: `shadow-panel` behind torn panels and the canvas, `shadow-card` under cards, `shadow-note` under taped notes, `shadow-button` behind buttons, `shadow-photo` behind pinned photos. A clipped (torn) element can't show a box-shadow, so draw its slab as a second torn shape with the same seed.
- **Paint texture.** Panels, cards, tape and the canvas carry the blotch texture (`assets/Textures/blotch.svg`) blended soft-light. The whole page carries film grain at `opacity-grain`.
- **Tape** strips (`tan`, `lavender`, `pink` at `opacity-tape`) hold notes and photos; their edges are roughened by the `si-rough` filter.

## The hand-drawn layer

- Marker notes (`Scrawl`), the circle around a headline's key word and brush underlines (`InkMarks`) are drawn on top of the layout.
- Ink lines draw themselves in once (`StudioInk.drawIn`) and then **boil**: the line wobbles as the filter is re-seeded 12 times a second (`StudioInk.boil`), like a 2D animated drawing.
- One mark per headline, one note per block. The marks annotate; they never carry content.

## Motion

- **On twos.** Hand-drawn things (boil, embers) step at 12fps; 3D and physics run smoothly at 60fps. That contrast is the 2D/3D mix.
- **Entrances.** Hero lines rise and rotate in from -60deg on X; title letters rise out of their line (`StudioInk.rise`, 35ms stagger); marker notes pop in with a little overshoot; cards flip in from -40deg on Y, one after another.
- **Scroll.** Panels lift off the page (rotateX 26deg to 0) as they arrive; the hero tips back as you leave it; giant titles drift 3% sideways; a `red` progress line grows across the top.
- **Pointer.** Panels and cards tilt toward the cursor; a card's slab turns `red`; figure particles get pushed away and tint `fig-glow`.
- **Reduced motion.** With `prefers-reduced-motion: reduce`, nothing moves: no boil, no entrances, no scroll effects, figures start settled. Every element must already be in its final, visible state.

## Particle figures

The signature visual: an image drawn as a few thousand dots on the canvas, each held to its place by a spring, `v += 0.045·(x₀ − x) + F`, `v *= 0.85`, and pushed by the cursor. Draw dots by tone:

- tone below 0.6: warm halftone, larger and translucent, from `fig-skin-light` to `fig-skin-deep`
- tone 0.6 and up: bold ink, from `fig-ink-soft` to `canvas-ink`
- hair (a region you mark): curved brush strokes, pointed at both ends, that wrap around the head ellipse and sweep one way like combed hair, ink at the roots to `fig-hair-indigo` at the tips, with a `fig-hair-sheen` band across the crown; light dots inside the hair become dark `fig-hair-indigo` gaps

Use `StudioInk.particleFigure` (see `FigurePlate`) and print the update rule and a live readout (`N = …`, cursor x and y) on the canvas.

## Iconography

- There is **no icon set** and **no logo**. The name is set in Permanent Marker (`t-wordmark`) as the mark; don't draw a logo for it.
- Arrows are text glyphs: `→` for actions, `↗` for links that leave the site. Bullets and separators are a marker `×` in `red`.
- Diagrams are drawn in code (canvas or SVG), in the system's inks: `bone` strokes, `tan` and `lavender` cel-shaded spheres with `deep` outlines, `red` paint-streak trails.

## Accessibility

- `bone` on `ink` 15.5:1, `bone-muted` on `ink` 6.3:1, `muted-on-bone` on `bone` 4.8:1. Title colours on `ink`: `tan` 9.0, `pink` 9.7, `lavender` 7.4, `sand` 9.9, `red` 5.3.
- `red` on `bone` is 2.9:1: only for marks and type 24px and larger.
- `canvas-accent` is 4.3:1 on `canvas-mid`, just under 4.5:1 for its 12px equations; keep equations on the lighter part of the canvas.
- Focus: a solid 2px `red` outline offset 4px on every interactive element.
- Marker notes and decorative ink are `aria-hidden`; split titles keep an `aria-label` with the full text; figures get `role="img"` and a description.

## Using it in your own page

1. Link `components/bundle.css` (it imports the fonts) after the tokens' CSS, and load `components/bundle.js`.
2. Call `StudioInk.init()` once the page has loaded: it adds the boil and rough filters, starts the boil and tears every element with `data-si-tear`.
3. Build sections from `.si-band` and the components; every class starts with `si-`.

Not synced from the source: the site's background interference field, light shafts, embers and the 3D atom are page-specific scenes, described here but not packaged; the real portrait's dot data stays in the website.

## Files in this folder

- **Sources** (edit these): `tokens.json`, `components/bundle.src.css`, `components/bundle.js`, `components/index.d.ts`, each `components/<Name>/README.md` and `preview.html`, and `assets/`.
- **Generated** (don't edit): `tokens.css`, `components/bundle.css` and the gallery `index.html`. After changing a source, run `python3 design-system/build.py` from the repository root; it needs only Python 3.
- To use the system in a page, link `tokens.css` and `components/bundle.css`, load `components/bundle.js`, and call `StudioInk.init()`.
- The same system is kept as the Studio Ink design-system artifact on claude.ai, with the same file layout.
