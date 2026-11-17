# OrbitalCloud
Real hydrogen orbitals drawn as clouds of points sampled from |ψ|², coloured by the sign of ψ, that spring from one shape to the next when you pick another orbital.

**Use** in a `TornPanel` for anything about atoms or chemistry, with `si-chip` buttons to switch orbitals and the formula of the one showing. Clicking the canvas should step to the next orbital.

**The consumer provides** a `<canvas class="si-live">` filling the panel and calls `StudioInk.orbitals(canvas, {mode, onChange})`; it returns `{set(name), mode}` with names `1s`, `2p`, `3d`. `onChange(name, formula)` fires on every switch, so the formula label can follow. Wire buttons with `StudioInk.chips(group, name => orbitals.set(name))`.

- 1s: |ψ|² ∝ e^(−2r). 2p_z: r² e^(−r) cos²θ. 3d_z²: r⁴ e^(−2r/3)(3cos²θ − 1)². r in Bohr radii, θ from the vertical axis; 1,400 points each by rejection sampling.
- Positive ψ in `tan`, negative in `lavender`; the proton is a `red` dot with a `deep` rim. Depth sets size and opacity.
- The cloud turns slowly and tilts toward the pointer; under reduced motion it switches without animating.
- Give the canvas an `aria-label` and update it when the orbital changes.
