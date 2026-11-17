# InkMarks
Hand-drawn SVG marks, a circle around a word and a brush underline, that draw themselves in and then boil.

**Use** `.si-circle` to circle the one key word in a headline and `.si-under` to underline a phrase that should land (the last line of a headline, the end of a statement). One mark per headline.

**The consumer provides** the word and an inline `<svg class="si-ink" viewBox="…" preserveAspectRatio="none">` with `<path pathLength="1">` strokes; copy the paths from this preview. Call `StudioInk.drawIn(root)` to draw them in; with reduced motion they appear drawn.

- Circle: `red`, 4px stroke. Underline: `tan`, a thick and a thin stroke.
- Arrows use the same path style in `red`, 3px.
