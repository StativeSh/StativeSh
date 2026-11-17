# DoubleSlit
A live solution of the 2D time-dependent Schrödinger equation: a Gaussian wavepacket meets a barrier with one or two slits, and a screen near the right edge builds up the interference pattern.

**Use** in a dark `TornPanel` (`.si-panel--dark`) wherever a quantum or wave idea needs showing, with `si-chip` buttons for one slit, two slits and firing again, and the equation as the chip label.

**The consumer provides** a `<canvas class="si-live">` filling the panel and calls `StudioInk.doubleSlit(canvas, {slits})`; it returns `{fire(y), slits(n)}`. Clicking the canvas fires a packet at that height.

- Physics: i∂ψ/∂t = −½∇²ψ + Vψ with ħ = m = 1, Visscher's staggered scheme (Re ψ and Im ψ leapfrog), a 240 × 108 grid, dt = 0.18, barrier height 6, absorbing edges, wavenumber 1.25.
- Colour: |ψ| maps ink → `fig-hair-indigo` → a pink-red → `canvas-light`, with automatic gain so the pattern stays visible as it spreads; the barrier is `bone`; the screen's accumulated |ψ|² is `tan` bars.
- It loops while visible and pauses off screen; under reduced motion it shows one settled frame and the buttons recompute it.
- Cost: about 300,000 updates per frame; keep one per page.
