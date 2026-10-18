import { getState } from "../game/store";

let ctx: AudioContext | null = null;

function beep(freq: number, dur = 0.1, type: OscillatorType = "square", vol = 0.05, delay = 0): void {
  if (!getState().sound) return;
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  } catch {
    /* pas d'audio : on joue en silence */
  }
}

export const sfx = {
  ok: (): void => {
    beep(660, 0.09);
    beep(880, 0.12, "square", 0.05, 0.09);
  },
  ko: (): void => beep(160, 0.28, "sawtooth", 0.06),
  win: (): void => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.16, "square", 0.05, i * 0.12)),
  lose: (): void => [330, 262, 196].forEach((f, i) => beep(f, 0.22, "sawtooth", 0.05, i * 0.18)),
};

/** « +30 » qui s'envole au centre de l'écran. */
export function floatText(text: string): void {
  const el = document.createElement("div");
  el.className = "float";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

const COLORS = ["#f5b400", "#7c5cff", "#4caf50", "#e5484d", "#2f8fff"];

export function confetti(): void {
  let canvas = document.getElementById("fx") as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "fx";
    document.body.appendChild(canvas);
  }
  const g = canvas.getContext("2d");
  if (!g) return;
  const w = (canvas.width = innerWidth);
  const h = (canvas.height = innerHeight);
  const parts = Array.from({ length: 110 }, () => ({
    x: w / 2, y: h * 0.35,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 12 - 3,
    s: 4 + Math.random() * 5,
    c: COLORS[Math.floor(Math.random() * COLORS.length)] as string,
  }));
  let frame = 0;
  const step = (): void => {
    g.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.vy += 0.35;
      p.x += p.vx;
      p.y += p.vy;
      g.fillStyle = p.c;
      g.fillRect(p.x, p.y, p.s, p.s);
    }
    if (++frame < 110) requestAnimationFrame(step);
    else g.clearRect(0, 0, w, h);
  };
  step();
}
