# Button
A square, uppercase action in Anton with a hard red slab behind it that grows on hover and disappears when pressed.

**Use** `.si-btn` for actions and `.si-btn--solid` for the one main action in a view. Put a `.si-link` beside a button for the secondary route. Group them in `.si-actions`.

**The consumer provides** an `<a>` or `<button>` with the label and an optional arrow: `<span class="si-ar" aria-hidden="true">→</span>`.

- At rest the slab is `shadow-button` (5px, `red`); on hover `shadow-button-hover` with a 2px lift; on press it presses 5px into the slab.
- On ink, the solid button is `bone` with `ink` text; on bone and ruled bands it inverts to `ink` with `bone` text.
- Focus shows a 2px `red` outline offset 4px.

Don't round it, don't use more than one solid button per view, and don't change the slab colour.
