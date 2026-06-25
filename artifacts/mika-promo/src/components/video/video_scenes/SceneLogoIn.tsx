import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DarkStage } from '../parts/DarkStage';
import { MikaLogo } from '../parts/MikaLogo';
import { useFormat } from '../FormatContext';

export function SceneLogoIn() {
  const isSquare = useFormat() === 'square';
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [setTimeout(() => setPhase(1), 250), setTimeout(() => setPhase(2), 1800)];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <DarkStage exitScale={1.04}>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.86, filter: 'blur(8px)' }}
          animate={phase >= 1 ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <MikaLogo height={isSquare ? '40cqmin' : '48cqmin'} stacked={isSquare} />
        </motion.div>
      </div>
    </DarkStage>
  );
}
