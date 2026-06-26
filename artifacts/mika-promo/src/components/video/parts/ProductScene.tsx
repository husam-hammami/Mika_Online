import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ClipFrame } from './ClipFrame';
import { MikaLogo } from './MikaLogo';
import { useFormat } from '../FormatContext';

const STEPS = ['Upload', 'Read', 'Answer', 'Ask'];

function StepTracker({ active }: { active: number }) {
  return (
    <div className="flex items-center justify-center gap-[1.4cqw]">
      {STEPS.map((label, i) => {
        const isActive = i === active;
        const isDone = i < active;
        return (
          <div key={label} className="flex items-center gap-[1.4cqw]">
            <motion.div
              className="flex items-center gap-[1cqw] rounded-full px-[2cqmin] py-[1.1cqmin]"
              style={{
                background: isActive ? '#1e6bff' : 'rgba(15,23,42,0.05)',
                border: isActive ? 'none' : '1px solid rgba(15,23,42,0.12)',
              }}
              initial={false}
              animate={{ scale: isActive ? 1 : 0.96, opacity: isActive || isDone ? 1 : 0.55 }}
              transition={{ duration: 0.4 }}
            >
              <span
                className="font-display font-bold text-[2.1cqmin] tabular-nums"
                style={{ color: isActive ? '#ffffff' : '#1e6bff' }}
              >
                0{i + 1}
              </span>
              <span
                className="font-display font-semibold text-[2.1cqmin]"
                style={{ color: isActive ? '#ffffff' : '#475569' }}
              >
                {label}
              </span>
            </motion.div>
            {i < STEPS.length - 1 && (
              <div className="w-[3cqmin] h-[2px] rounded-full" style={{ background: 'rgba(15,23,42,0.15)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BrowserFrame({ src, start, delay }: { src: string; start: number; delay: number }) {
  return (
    <motion.div
      className="relative w-full h-full rounded-[2cqmin] overflow-hidden bg-white"
      style={{ boxShadow: '0 26px 70px rgba(15,40,90,0.18)', border: '1px solid rgba(15,23,42,0.08)' }}
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-[1cqmin] px-[2cqmin] h-[4.4cqmin] bg-[#eef2f8] border-b border-[#e2e8f0]">
        <span className="w-[1.4cqmin] h-[1.4cqmin] rounded-full bg-[#ff5f57]" />
        <span className="w-[1.4cqmin] h-[1.4cqmin] rounded-full bg-[#febc2e]" />
        <span className="w-[1.4cqmin] h-[1.4cqmin] rounded-full bg-[#28c840]" />
        <div className="ml-[2cqmin] flex-1 max-w-[40%] rounded-full bg-white border border-[#e2e8f0] h-[2.6cqmin] flex items-center px-[1.5cqmin]">
          <span className="font-display text-[1.5cqmin] text-[#94a3b8]">mika · clinical imaging intelligence</span>
        </div>
      </div>
      <div className="relative w-full h-[calc(100%-4.4cqmin)] bg-white">
        <ClipFrame src={src} start={start} objectClass="object-contain" />
      </div>
    </motion.div>
  );
}

interface ProductSceneProps {
  src: string;
  start?: number;
  stepIndex: number;
  eyebrow: string;
  headline: string;
  sub: string;
}

export function ProductScene({ src, start = 0, stepIndex, eyebrow, headline, sub }: ProductSceneProps) {
  const isSquare = useFormat() === 'square';
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 250);
    return () => clearTimeout(t);
  }, []);

  const caption = (
    <div className={isSquare ? 'flex flex-col items-center text-center px-[6cqw]' : 'flex flex-col items-start text-left'}>
      <motion.div
        className="font-display font-bold tracking-[0.26em] text-[2.2cqmin] mb-[1.6cqh]"
        style={{ color: '#1e6bff' }}
        initial={{ opacity: 0, y: 12 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {eyebrow}
      </motion.div>
      <motion.h2
        className="font-display font-bold leading-[1.05] text-[6cqmin]"
        style={{ color: '#0b1220' }}
        initial={{ opacity: 0, y: 16 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {headline}
      </motion.h2>
      <motion.p
        className="font-display leading-snug text-[2.9cqmin] mt-[1.8cqh] max-w-[94%]"
        style={{ color: '#475569' }}
        initial={{ opacity: 0, y: 14 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {sub}
      </motion.p>
    </div>
  );

  return (
    <motion.div
      className="absolute inset-0 z-10 overflow-hidden"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #eef3fb 55%, #e6edf8 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* clinical dotted grid */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(30,107,255,0.10) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'radial-gradient(120% 80% at 50% 30%, black, transparent 80%)',
        }}
      />

      <motion.div
        className="absolute z-30"
        style={{ top: '1.5cqh', left: isSquare ? '3cqw' : '2.5cqw' }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={show ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <MikaLogo height="15cqmin" onLight />
      </motion.div>

      {isSquare ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3cqh] px-[5cqw] pt-[3cqh]">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <StepTracker active={stepIndex} />
          </motion.div>
          <div className="w-[90cqw] h-[44cqh]">
            <BrowserFrame src={src} start={start} delay={0.15} />
          </div>
          {caption}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col px-[6cqw] py-[7cqh]">
          <motion.div
            className="flex justify-center mb-[5cqh]"
            initial={{ opacity: 0, y: -10 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <StepTracker active={stepIndex} />
          </motion.div>
          <div className="flex-1 flex flex-row items-center gap-[4cqw]">
            <div className="w-[32cqw] shrink-0">{caption}</div>
            <div className="w-[60cqw] h-[64cqh]">
              <BrowserFrame src={src} start={start} delay={0.15} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
