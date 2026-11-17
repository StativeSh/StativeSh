# MegaTitle
A giant condensed uppercase title (Anton, `t-mega`) in one flat colour, used for section names and project names; its letters rise into place.

**Use** for each project's name, overlapping the bottom of its `TornPanel` (add `.si-title-over`), or for a section name on bone. Give each project its own colour from `tan`, `pink`, `lavender`, `sand`, in that order; `red` is for section titles.

**The consumer provides** the text. Call `StudioInk.split(el)` and then `StudioInk.rise(el)` when it scrolls into view; split keeps an `aria-label` with the full text.

On ink the title gets a 6px/8px `deep` extrusion. Keep titles to one or two words.
