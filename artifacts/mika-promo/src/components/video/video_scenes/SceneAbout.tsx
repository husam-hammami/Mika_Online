import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DarkStage } from '../parts/DarkStage';
import { useFormat } from '../FormatContext';

const SHADOW = '0 2px 22px rgba(0,0,0,0.7)';
const EASE = [0.16, 1, 0.3, 1] as const;

export function SceneAbout() {
  const format = useFormat();
  const isSquare = format === 'square';
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 2600),
      setTimeout(() => setPhase(3), 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const photo = (
    <motion.div
      className="relative shrink-0 overflow-hidden"
      style={{
        width: isSquare ? '34cqw' : '40cqh',
        height: isSquare ? '34cqw' : '40cqh',
        borderRadius: isSquare ? '50%' : '4cqmin',
        boxShadow:
          '0 0 0 1px rgba(150,175,220,0.22), 0 18px 45px rgba(0,0,0,0.5)',
      }}
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={phase >= 1 ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <img
        src={`${import.meta.env.BASE_URL}brand/founder.png`}
        alt="MIKA founder"
        className="w-full h-full object-cover object-center"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 40px rgba(3,4,10,0.55)' }}
      />
    </motion.div>
  );

  const copy = (
    <div
      className={`flex flex-col ${isSquare ? 'items-center text-center' : 'items-start text-left'}`}
      style={{ gap: '2.2cqh', maxWidth: isSquare ? '84cqw' : '46cqw' }}
    >
      <motion.h2
        className="font-display font-bold text-white leading-[1.16] text-[4.2cqmin]"
        initial={{ opacity: 0, y: 16 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE }}
        style={{ textShadow: SHADOW }}
      >
        I’m not a doctor or a company. I’m someone this happened to.
      </motion.h2>

      <motion.p
        className="font-display font-medium text-[#cdd8ea] leading-snug text-[2.9cqmin]"
        initial={{ opacity: 0, y: 14 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE }}
        style={{ textShadow: SHADOW }}
      >
        I built MIKA so you never have to feel as lost as I did.
      </motion.p>

      <motion.div
        className={`flex flex-col ${isSquare ? 'items-center' : 'items-start'} mt-[1cqh]`}
        initial={{ opacity: 0, y: 12 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <span
          className="font-display font-bold text-white text-[3cqmin] leading-tight"
          style={{ textShadow: SHADOW }}
        >
          Husam
        </span>
      </motion.div>
    </div>
  );

  return (
    <DarkStage>
      {isSquare ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[4cqh] px-[8cqw]">
          {photo}
          {copy}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center gap-[6cqw] px-[9cqw]">
          {photo}
          {copy}
        </div>
      )}
    </DarkStage>
  );
}
