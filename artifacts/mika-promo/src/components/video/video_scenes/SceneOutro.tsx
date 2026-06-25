import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DarkStage } from '../parts/DarkStage';
import { MikaLogo } from '../parts/MikaLogo';
import { useFormat } from '../FormatContext';

const SHADOW = '0 2px 22px rgba(0,0,0,0.7)';

export function SceneOutro() {
  const isSquare = useFormat() === 'square';
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 350),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <DarkStage exitScale={1.04}>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-[8cqw]">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <MikaLogo height={isSquare ? '32cqmin' : '40cqmin'} stacked={isSquare} />
        </motion.div>

        <motion.p
          className="font-display font-bold text-white leading-tight text-[4.6cqmin] mt-[3cqh] max-w-[80cqw]"
          initial={{ opacity: 0, y: 16 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textShadow: SHADOW }}
        >
          You don’t have to face it alone.
        </motion.p>

        <motion.span
          className="font-display font-bold tracking-wide text-white rounded-full px-[4.5cqw] py-[1.5cqh] text-[3.8cqmin] mt-[3.2cqh]"
          style={{ background: '#1e6bff', boxShadow: '0 10px 34px rgba(30,107,255,0.5)' }}
          initial={{ opacity: 0, y: 14, scale: 0.94 }}
          animate={phase >= 3 ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          MIKA is free for everyone
        </motion.span>
      </div>
    </DarkStage>
  );
}
