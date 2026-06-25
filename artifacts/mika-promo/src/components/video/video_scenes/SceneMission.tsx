import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DarkStage } from '../parts/DarkStage';

const SHADOW = '0 2px 22px rgba(0,0,0,0.7)';

export function SceneMission() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 2400),
      setTimeout(() => setPhase(3), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <DarkStage>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-[9cqw] gap-[3cqh]">
        <motion.div
          className="font-display font-semibold tracking-[0.32em] text-[2.2cqmin]"
          style={{ color: '#93b4ff' }}
          initial={{ opacity: 0, y: 12 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          WHY IT’S FREE
        </motion.div>

        <motion.h2
          className="font-display font-bold text-white leading-[1.12] text-[5.4cqmin] max-w-[84cqw]"
          initial={{ opacity: 0, y: 16 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ textShadow: SHADOW }}
        >
          It’s free. For anyone who needs it.
        </motion.h2>

        <motion.p
          className="font-display font-medium text-[#cdd8ea] leading-snug text-[3.5cqmin] max-w-[80cqw]"
          initial={{ opacity: 0, y: 14 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textShadow: SHADOW }}
        >
          I know how it feels to be alone and afraid, holding answers about your
          own body that you can’t understand.
        </motion.p>

        <motion.p
          className="font-display font-bold text-white leading-tight text-[4.4cqmin] mt-[1.5cqh] max-w-[84cqw]"
          initial={{ opacity: 0, y: 18 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ textShadow: SHADOW }}
        >
          No one should be left to figure that out by themselves.
        </motion.p>
      </div>
    </DarkStage>
  );
}
