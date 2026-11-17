# FigurePlate
A lit cream canvas with a torn edge holding a particle figure: any image drawn as springy dots, with ink features, warm halftone skin and brush-stroke hair, plus a live readout, the real update rule and a caption.

**Use** for the one hero visual of a page (a portrait), or any figure you want to feel hand-printed and alive.

**The consumer provides** the points and the copy. Convert an image to `[[x, y, tone], …]` in a 300 × 376 box (sample dark pixels, tone 0 light to 1 dark) and call
`StudioInk.particleFigure(canvas, points, {isHair: (x, y, tone) => …, head: {cx, cy, ax, ay}})`.
`isHair` marks the hair region (strands wrap the `head` ellipse); omit it for figures without hair.

- Physics: each dot springs home, `v += 0.045·(x₀ − x) + F`, `v *= 0.85`; the cursor pushes dots away and tints them `fig-glow`.
- Tone below 0.6: halftone from `fig-skin-light` to `fig-skin-deep`. 0.6 and up: ink from `fig-ink-soft` to `canvas-ink`. Hair: strands from ink to `fig-hair-indigo`, with a `fig-hair-sheen` band across the crown.
- Keep readout and equation text in the lighter middle of the canvas (`canvas-muted` and `canvas-accent` lose contrast near `canvas-dark`).
- The plate and its `.si-plate__shadow` share a `data-si-tear` seed with `data-si-radius="26"` (`radius-torn-sm`).

This preview draws a generated head, not a real portrait.
