import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

export function FadeIn({
  children,
  delay = 0,
  duration = 0.8,
  y = 40,
  className = "",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-10%" });
  const reduceMotion = useReducedMotion();

  // Honor the OS "reduce motion" setting: no slide/fade, just render in place.
  const from = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y };
  const to = reduceMotion
    ? { opacity: 1, y: 0 }
    : isInView
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y };

  return (
    <motion.div
      ref={ref}
      initial={from}
      animate={to}
      transition={{ duration: reduceMotion ? 0 : duration, delay: reduceMotion ? 0 : delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
