import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DarkStage } from '../parts/DarkStage';

const SHADOW = '0 2px 22px rgba(0,0,0,0.7)';
const EASE = [0.16, 1, 0.3, 1] as const;

const ORDEAL = [
  'A cauda equina emergency',
  'Two spine surgeries',
  'Failed back surgery syndrome',
  'An S1 nerve injury',
];

export function SceneStory() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 5200),
      setTimeout(() => setPhase(4), 7600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <DarkStage spine>
      <div className="absolute inset-0 flex flex-col justify-center px-[10cqw] gap-[2.4cqh]">
        <motion.p
          className="font-display font-bold text-white leading-[1.12] text-[4.8cqmin] max-w-[82cqw]"
          initial={{ opacity: 0, y: 16 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ textShadow: SHADOW }}
        >
          This started with me.
        </motion.p>

        <div className="flex flex-col gap-[1.3cqh] mt-[0.4cqh]">
          {ORDEAL.map((item, i) => (
            <motion.div
              key={item}
              className="flex items-center gap-[1.8cqw]"
              initial={{ opacity: 0, x: -14 }}
              animate={phase >= 2 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.45, ease: EASE }}
            >
              <span
                className="shrink-0"
                style={{
                  width: '0.9cqmin',
                  height: '0.9cqmin',
                  borderRadius: '50%',
                  background: '#4d8bff',
                  boxShadow: '0 0 10px rgba(77,139,255,0.85)',
                }}
              />
              <span
                className="font-display font-medium text-[#cdd8ea] text-[2.9cqmin]"
                style={{ textShadow: SHADOW }}
              >
                {item}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="font-display font-semibold leading-snug text-[3.4cqmin] max-w-[82cqw] mt-[1cqh]"
          style={{ color: '#ffffff', textShadow: SHADOW }}
          initial={{ opacity: 0, y: 14 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
        >
          The warning signs were there. They decided I was{' '}
          <span style={{ color: '#4d8bff' }}>“high risk, low reward”</span> and
          made me wait.
        </motion.p>

        <motion.p
          className="font-display italic font-medium leading-snug text-[3cqmin] max-w-[80cqw]"
          style={{ color: '#cdd8ea', textShadow: SHADOW }}
          initial={{ opacity: 0, y: 14 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
        >
          I spent almost a year between a bed and a wheelchair. The damage is
          permanent.
        </motion.p>
      </div>
    </DarkStage>
  );
}
