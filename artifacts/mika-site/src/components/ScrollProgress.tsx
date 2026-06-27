import { motion, useScroll, useSpring } from "framer-motion";

/** Thin glowing bar at the very top that tracks page scroll progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#1e6bff] via-[#7db1ff] to-[#1e6bff] shadow-[0_0_12px_rgba(30,107,255,0.85)]"
    />
  );
}
