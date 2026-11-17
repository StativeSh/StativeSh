# Scrawl
A handwritten marker note in Permanent Marker, tilted and slightly wobbling, laid over titles and panels like an annotation on a print.

**Use** for short asides in the first person, lowercase, ending with `!` when excited: "that's me!", "all 118 of them!", "runs live in your browser". Never for information the reader needs; it is commentary.

**The consumer provides** the text and the position (usually `position:absolute` over a title or panel). `.si-hello` is the larger greeting above a hero headline.

- Colour: `red` by default; `.si-scrawl--bone` on panels; `.si-scrawl--ink` where it sits on bone.
- Rotation -5 to -9deg. Size `t-scrawl` (fluid 20 to 32px).
- With `StudioInk.init()` the note boils (redrawn at 12fps) like hand-drawn animation.

At most one scrawl per block. Don't put scrawls on body text or buttons.
