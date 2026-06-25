import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DarkStage } from '../parts/DarkStage';

const SHADOW = '0 2px 22px rgba(0,0,0,0.7)';
const EASE = [0.16, 1, 0.3, 1] as const;

export function SceneProof() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 2300),
      setTimeout(() => setPhase(3), 4400),
      setTimeout(() => setPhase(4), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <DarkStage>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-[9cqw] gap-[3cqh]">
        <motion.h2
          className="font-display font-bold text-white leading-[1.1] text-[5.8cqmin] max-w-[84cqw]"
          initial={{ opacity: 0, y: 16 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ textShadow: SHADOW }}
        >
          The hardest part wasn’t the pain.
        </motion.h2>

        <motion.p
          className="font-display font-medium text-[#cdd8ea] leading-snug text-[3.4cqmin] max-w-[78cqw]"
          initial={{ opacity: 0, y: 14 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ textShadow: SHADOW }}
        >
          It was holding scan after scan of my own body and not understanding a thing.
        </motion.p>

        <motion.p
          className="font-display font-bold text-white text-[4.2cqmin] mt-[1cqh]"
          initial={{ opacity: 0, y: 14 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ textShadow: SHADOW }}
        >
          So I built MIKA.
        </motion.p>

        <motion.p
          className="font-display font-medium text-[#cdd8ea] text-[3.2cqmin]"
          initial={{ opacity: 0, y: 14 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ textShadow: SHADOW }}
        >
          It found what they missed.
        </motion.p>
      </div>
    </DarkStage>
  );
}
