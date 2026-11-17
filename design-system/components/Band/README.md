# Band
A full-width horizontal band, black (`ink`), bone or ruled paper, that every section of a page sits in.

**Use it** to build the page's rhythm: alternate `.si-band--ink` and `.si-band--bone`/`.si-band--ruled` with hard edges, never gradients between them. Put content in a `.si-wrap` (max `wrap-max`) inside.

**The consumer provides** the section content. The band supplies ground colour, text colour, the fluid side gutter (`gutter-min` to `gutter`) and `block-y` vertical padding.

- `.si-band--ink`: dark sections (hero, projects, about). Text in `bone`, secondary in `bone-muted`.
- `.si-band--bone`: light sections. Text in `ink`.
- `.si-band--ruled`: bone with 2px `ruled-line` rules every 40px, for notebook-like content (notes, the word ring).

Don't round a band's corners or add shadows to it. Don't put two bands of the same colour next to each other.
