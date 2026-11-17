# Textures

Two noise images that give surfaces their painted, printed feel. Both are greyscale SVG turbulence; they have no colour of their own.

- **blotch.svg** (640 × 640, tiles seamlessly): soft paint mottling. Lay it over panels, cards, tape and the figure canvas with `background-blend-mode: soft-light` at its native 640px tile size. `components/bundle.css` carries it inline as `--si-blotch`.
- **grain.svg** (240 × 240, tiles seamlessly): fine film grain. Use it once, on a fixed full-page layer at `opacity-grain` with `pointer-events: none`. Carried inline as `--si-grain`.

Both filters cover exactly the image (`x="0" y="0" width="100%" height="100%"`), which is what lets them tile without seams.
