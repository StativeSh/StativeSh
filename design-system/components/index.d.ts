/** Studio Ink: window.StudioInk, from components/bundle.js. Plain functions on plain DOM; no framework. */

/** A point of a particle figure: x and y in the figure's box, tone 0 (light) to 1 (dark). */
export type FigurePoint = [x: number, y: number, tone: number];

export interface ParticleFigureOptions {
  /** Width of the box the points live in. Default 300. */
  width?: number;
  /** Height of the box the points live in. Default 376. */
  height?: number;
  /** Return true for points in the hair region; dark ones become strands, light ones dark gaps. */
  isHair?: (x: number, y: number, tone: number) => boolean;
  /** The head ellipse strands wrap around, in box units. Default fits a 300 × 376 portrait. */
  head?: { cx: number; cy: number; ax: number; ay: number };
}

export interface TearOptions {
  /** Same seed, same tear: give a panel and its shadow slab the same one. Default 5. */
  seed?: number;
  /** Corner radius in px: radius-torn (34) for panels, radius-torn-sm (26) for the canvas. */
  radius?: number;
  /** How deep the rips go, in px. Default 5. */
  amp?: number;
}

export interface RingOptions {
  /** Number of words around the cylinder. Default 16. */
  count?: number;
  /** Cylinder radius in px. Default 980. */
  radius?: number;
}

export interface StudioInk {
  /** Add the si-boil and si-rough SVG filters and switch them on (<html class="si-fx">). */
  defs(): void;
  /** Re-seed the boil filter so ink lines wobble. Default 12 fps. Off with reduced motion. */
  boil(fps?: number): void;
  /** Clip an element to a torn-paper rounded rectangle. */
  tear(el: HTMLElement, opts?: TearOptions): void;
  /** Tear every [data-si-tear="<seed>"] element (optional data-si-radius). */
  tearAll(root?: ParentNode): void;
  /** Split a title into .si-w word and .si-ch letter spans, keeping an aria-label. */
  split(el: HTMLElement): HTMLElement;
  /** Letters of a split title rise into place, 35ms apart. */
  rise(el: HTMLElement, delayMs?: number): void;
  /** Draw every .si-ink path under root, in order. */
  drawIn(root?: ParentNode, delayMs?: number, staggerMs?: number): void;
  /** Fill a .si-ring-in element with words on a turning 3D cylinder. */
  ring(el: HTMLElement, words: string[], opts?: RingOptions): void;
  /** Draw points as a springy particle figure on a canvas; returns the point count. */
  particleFigure(canvas: HTMLCanvasElement, points: FigurePoint[], opts?: ParticleFigureOptions): { count: number };
  /** defs() + boil() + tearAll(): call once when the page has loaded. */
  init(): void;
}

declare global {
  interface Window { StudioInk: StudioInk }
}
