import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "scale" | "fade";

const FROM: Record<Direction, { x: number; y: number; scale: number }> = {
  up: { x: 0, y: 1, scale: 1 },
  down: { x: 0, y: -1, scale: 1 },
  left: { x: -1, y: 0, scale: 1 },
  right: { x: 1, y: 0, scale: 1 },
  scale: { x: 0, y: 0, scale: 0.92 },
  fade: { x: 0, y: 0, scale: 1 },
};

/**
 * Scroll-linked reveal. As the element travels up through the viewport it
 * glides into place, stays fully readable through the middle of its journey,
 * then gently drifts out (up + blur + fade). Honors prefers-reduced-motion.
 */
export function Reveal({
  children,
  direction = "up",
  distance = 64,
  blur = 10,
  className = "",
  exit = true,
}: {
  children: ReactNode;
  direction?: Direction;
  distance?: number;
  blur?: number;
  className?: string;
  exit?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const from = FROM[direction];
  const exitFade = exit ? 0.12 : 1;
  const exitY = exit ? -distance * 0.5 : 0;
  const exitBlur = exit ? blur * 0.5 : 0;

  // 0 = entering at viewport bottom · ~0.22-0.78 = held in view · 1 = leaving top
  const pts = [0, 0.22, 0.78, 1];
  const opacity = useTransform(scrollYProgress, pts, [0, 1, 1, exitFade]);
  const x = useTransform(scrollYProgress, pts, [from.x * distance, 0, 0, 0]);
  const y = useTransform(scrollYProgress, pts, [from.y * distance, 0, 0, exitY]);
  const scale = useTransform(scrollYProgress, pts, [from.scale, 1, 1, 0.985]);
  const blurPx = useTransform(scrollYProgress, pts, [blur, 0, 0, exitBlur]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ opacity, x, y, scale, filter, willChange: "transform, opacity, filter" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
