# TornPanel
A media panel with a ripped paper edge and a hard black slab behind it, holding a canvas, image or video, with the project's giant title overlapping its bottom.

**Use** for the main visual of each project. Give the panel and its `.si-panel-shadow` the same `data-si-tear` seed so they tear alike; `StudioInk.tearAll()` (or `init()`) applies the polygon.

**The consumer provides** the media (a `<canvas>`, `<img>` or `<video>` filling the panel) and the title as a `.si-mega.si-title-over` right after the wrap. A `.si-scrawl` may sit in the panel's top right.

- Panel fill is `panel` under the blotch texture with a warm `tan` and cool `lavender` glow.
- Aspect 16:7.2 on desktop, 4:3 under 900px.
- Corner radius of the tear: `radius-torn`.
