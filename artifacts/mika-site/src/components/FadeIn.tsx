import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function FadeIn({
  children,
  delay = 0,
  duration = 0.8,
  y = 40,
  className = "",
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}