# LabControls
A collapsible "Lab controls" chip on a figure's canvas that opens sliders for the constants of its update rule, so visitors can change the physics they just read.

**Use** inside a `FigurePlate`, after the equation and before the caption (a `figcaption` must stay first or last). One per figure.

**The consumer provides** the markup below and a figure from `StudioInk.particleFigure`, then calls `StudioInk.labControls(detailsEl, figure)`.

- Inputs carry `data-si-lab="k"` (spring, 0.005–0.15, default 0.045), `"c"` (damping, 0.60–0.98, default 0.85) and `"r"` (push radius, 20–140px, default automatic); each has an `<output data-si-out="…">`.
- Put `data-si-eq="k"` and `data-si-eq="c"` on the numbers in the printed equation and they update live.
- Buttons `data-si-act="scatter"` (throws the dots out; hidden under reduced motion) and `data-si-act="reset"`.
- Keep the stable ranges: with this explicit update, k much above 0.15 at low damping starts to ring.

The chip is square like every control in the system; ink on the canvas, filled ink when open.
