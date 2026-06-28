import { useEffect, useRef } from "react";

type Mote = { x: number; y: number; vx: number; vy: number; r: number; a: number };
type Bloom = { bx: number; by: number; px: number; py: number; rad: number; a: number; phase: number };

/**
 * Hero backdrop — a calm, premium "aurora + drifting depth" field on a canvas. Replaces the old
 * node-link "neural network" look (a generic-AI cliché): soft brand-blue light blooms drift slowly
 * while a sparse field of out-of-focus motes floats — NO connecting lines, no hard geometry.
 *
 * Perf: a single soft glow sprite is pre-rendered once, then `drawImage`d (additive) for every bloom
 * and mote — no per-frame gradient allocation, so it stays smooth on low-end / software rendering.
 * DPR capped at 2; pauses off-screen and when the tab is hidden; renders one static frame under
 * prefers-reduced-motion; fully tears down RAF + observers on unmount.
 */
export function HeroBackdrop({
  className = "",
  color = "30, 107, 255",
  motes = 36,
}: {
  className?: string;
  color?: string;
  motes?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Pre-rendered soft glow sprite (built once) — drawn scaled + alpha-modulated each frame.
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 256;
    const sctx = sprite.getContext("2d");
    if (sctx) {
      const g = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, `rgba(${color}, 1)`);
      g.addColorStop(0.45, `rgba(${color}, 0.35)`);
      g.addColorStop(1, `rgba(${color}, 0)`);
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 256, 256);
    }

    let width = 0;
    let height = 0;
    let moteList: Mote[] = [];
    let bloomList: Bloom[] = [];
    let raf = 0;
    let t = 0;
    let visible = true;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const big = Math.max(width, height);
      bloomList = [
        { bx: width * 0.28, by: height * 0.34, px: 0, py: 0, rad: big * 0.55, a: 0.20, phase: 0 },
        { bx: width * 0.74, by: height * 0.62, px: 0, py: 0, rad: big * 0.42, a: 0.15, phase: 2.1 },
        { bx: width * 0.52, by: height * 0.16, px: 0, py: 0, rad: big * 0.30, a: 0.11, phase: 4.2 },
      ];

      const count = Math.round(Math.min(motes, (width * height) / 26000));
      moteList = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.8 + 0.6,
        a: Math.random() * 0.30 + 0.10,
      }));
    };

    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (const b of bloomList) {
        const cx = b.bx + b.px;
        const cy = b.by + b.py;
        const d = b.rad * 2;
        ctx.globalAlpha = b.a;
        ctx.drawImage(sprite, cx - b.rad, cy - b.rad, d, d);
      }
      for (const m of moteList) {
        const d = m.r * 9;
        ctx.globalAlpha = m.a;
        ctx.drawImage(sprite, m.x - d / 2, m.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const step = () => {
      t += 0.005;
      for (const b of bloomList) {
        b.px = Math.cos(t + b.phase) * width * 0.05;
        b.py = Math.sin(t * 0.8 + b.phase) * height * 0.06;
      }
      for (const m of moteList) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.x < -8) m.x = width + 8;
        else if (m.x > width + 8) m.x = -8;
        if (m.y < -8) m.y = height + 8;
        else if (m.y > height + 8) m.y = -8;
      }
    };

    const frame = () => {
      step();
      paint();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches) {
        paint(); // single static frame, no loop
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const stop = () => cancelAnimationFrame(raf);

    const onResize = () => {
      build();
      if (visible) start();
    };

    build();
    start();

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    reduce.addEventListener?.("change", start);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      reduce.removeEventListener?.("change", start);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [color, motes]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
