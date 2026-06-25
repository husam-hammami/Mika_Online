import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function DarkStage({
  children,
  spine = false,
  exitScale = 1,
}: {
  children: ReactNode;
  spine?: boolean;
  exitScale?: number;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-10 overflow-hidden"
      style={{ background: 'radial-gradient(125% 95% at 50% 42%, #0a1226 0%, #05070d 62%, #03040a 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: exitScale }}
      transition={{ duration: 0.7 }}
    >
      {/* electric blue glow */}
      <motion.div
        className="absolute rounded-full blur-[70px] pointer-events-none"
        style={{
          width: '70cqmin',
          height: '70cqmin',
          left: '50%',
          top: '45%',
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle, rgba(30,107,255,0.30), transparent 65%)',
        }}
        animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.12, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* faint helix spine motif (ties to logo) */}
      {spine && (
        <div
          className="absolute pointer-events-none"
          style={{ left: '12cqw', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, transparent, rgba(205,216,234,0.25), transparent)' }}
        />
      )}

      {/* subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 w-full h-full">{children}</div>
    </motion.div>
  );
}
