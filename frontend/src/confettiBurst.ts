import confetti from "canvas-confetti";

/** Pastel sticker-palette (matches the cute UI, avoids harsh primaries). */
const rainbowPalette = [
  "#fbd5d5",
  "#f7b1b1",
  "#c5e8df",
  "#e9c46a",
  "#ffd3e8",
  "#c9e4ff",
  "#fff5ba",
  "#d4c4f9",
];

const Z_BACK = 1;
const Z_APP = 10;
const Z_FRONT = 25;
const BACK_SHARE = 0.75;

/** Original baseline scalar before ±50% steps. */
const BASE_SCALAR = 1.65;
/** ±50% of baseline in 10% steps: 0.5× … 1.5×. */
const SCALAR_MULTIPLIERS = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5];

/** ~1s of animation at the library’s ~60fps cadence; high speed clears the frame. */
const TICKS_ONE_SECOND = 60;

type ConfettiInstance = ReturnType<typeof confetti.create>;

let backLayer: ConfettiInstance | null = null;
let frontLayer: ConfettiInstance | null = null;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ensureLayers(): { back: ConfettiInstance; front: ConfettiInstance } {
  if (backLayer && frontLayer) {
    return { back: backLayer, front: frontLayer };
  }

  const styleCanvas = (el: HTMLCanvasElement, z: number) => {
    el.setAttribute("aria-hidden", "true");
    el.style.position = "fixed";
    el.style.inset = "0";
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.pointerEvents = "none";
    el.style.zIndex = String(z);
  };

  const backCanvas = document.createElement("canvas");
  styleCanvas(backCanvas, Z_BACK);
  document.body.prepend(backCanvas);

  const root = document.getElementById("root");
  if (root) {
    root.style.position = "relative";
    root.style.zIndex = String(Z_APP);
  }

  const frontCanvas = document.createElement("canvas");
  styleCanvas(frontCanvas, Z_FRONT);
  document.body.appendChild(frontCanvas);

  backLayer = confetti.create(backCanvas, { resize: true });
  frontLayer = confetti.create(frontCanvas, { resize: true });

  return { back: backLayer, front: frontLayer };
}

function randomIn(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomScalarFromSteps(): number {
  const m = SCALAR_MULTIPLIERS[Math.floor(Math.random() * SCALAR_MULTIPLIERS.length)]!;
  return BASE_SCALAR * m;
}

function clampOrigin(n: number, pad = 0.04): number {
  return Math.min(1 - pad, Math.max(pad, n));
}

export type CelebrateDuckPickOptions = {
  /** Normalized viewport origin (0–1). When omitted, a centered mid-screen default is used. */
  origin?: { x: number; y: number };
};

/** Fire a burst split ~75% behind the UI and ~25% in front for depth. */
function burstSplit(layers: { back: ConfettiInstance; front: ConfettiInstance }, opts: confetti.Options): void {
  const total = typeof opts.particleCount === "number" ? opts.particleCount : 9;
  const backN = Math.max(0, Math.floor(total * BACK_SHARE));
  const frontN = Math.max(0, total - backN);
  const { particleCount: _pc, scalar: _scalar, ...rest } = opts;
  const scalarBack = randomScalarFromSteps();
  const scalarFront = randomScalarFromSteps();

  if (backN > 0) {
    layers.back({ ...rest, particleCount: backN, scalar: scalarBack });
  }
  if (frontN > 0) {
    layers.front({ ...rest, particleCount: frontN, scalar: scalarFront });
  }
}

/**
 * Rainbow burst: no velocity decay (decay: 1); velocities tuned so confetti stays
 * readable for ~1s before fading. (canvas-confetti still eases opacity by tick.)
 */
export function celebrateDuckPick(options?: CelebrateDuckPickOptions): void {
  const reduceMotion = prefersReducedMotion();
  const layers = ensureLayers();

  const ox = options?.origin?.x ?? 0.5;
  const oy = options?.origin?.y ?? 0.42;

  if (reduceMotion) {
    burstSplit(layers, {
      particleCount: 6,
      spread: 28,
      startVelocity: 14,
      ticks: TICKS_ONE_SECOND,
      gravity: 0.9,
      decay: 1,
      origin: { x: clampOrigin(ox), y: clampOrigin(oy) },
      shapes: ["square", "circle"],
      colors: rainbowPalette,
      disableForReducedMotion: true,
    });
    return;
  }

  const common = {
    spread: randomIn(29, 39),
    startVelocity: randomIn(24, 36),
    ticks: TICKS_ONE_SECOND,
    gravity: randomIn(1.1, 1.5),
    decay: 1,
    shapes: ["square", "circle"] as confetti.Shape[],
    colors: rainbowPalette,
    disableForReducedMotion: true,
  };

  /** ~25% more than the prior 2–4 / 14 counts (→ ~3–5 sides, 18 center). */
  const sideCount = Math.round(randomIn(2.5, 5));
  const centerCount = 18;

  burstSplit(layers, {
    ...common,
    particleCount: sideCount,
    origin: { x: clampOrigin(ox - 0.1), y: clampOrigin(oy) },
  });
  burstSplit(layers, {
    ...common,
    particleCount: sideCount,
    origin: { x: clampOrigin(ox + 0.1), y: clampOrigin(oy) },
  });
  burstSplit(layers, {
    ...common,
    particleCount: centerCount,
    spread: randomIn(36, 46),
    startVelocity: randomIn(26, 38),
    origin: { x: clampOrigin(ox), y: clampOrigin(oy) },
  });
}
