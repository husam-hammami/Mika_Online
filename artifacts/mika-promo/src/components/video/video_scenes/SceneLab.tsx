import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MikaLogo } from '../parts/MikaLogo';
import { useFormat } from '../FormatContext';

function LabFrame({ src, label, delay }: { src: string; label: string; delay: number }) {
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
        <div className="ml-[2cqmin] flex-1 max-w-[48%] rounded-full bg-white border border-[#e2e8f0] h-[2.6cqmin] flex items-center px-[1.5cqmin]">
          <span className="font-display text-[1.5cqmin] text-[#94a3b8]">{label}</span>
        </div>
      </div>
      <div className="relative w-full h-[calc(100%-4.4cqmin)] bg-white">
        <img src={src} alt="" className="w-full h-full object-contain" />
      </div>
    </motion.div>
  );
}

export function SceneLab() {
  const isSquare = useFormat() === 'square';
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 250);
    return () => clearTimeout(t);
  }, []);

  const labResult = `${import.meta.env.BASE_URL}product/lab_result.png`;
  const labValues = `${import.meta.env.BASE_URL}product/lab_values.png`;

  const caption = (
    <div className={isSquare ? 'flex flex-col items-center text-center px-[6cqw]' : 'flex flex-col items-start text-left'}>
      <motion.div
        className="font-display font-bold tracking-[0.26em] text-[2.2cqmin] mb-[1.6cqh]"
        style={{ color: '#1e6bff' }}
        initial={{ opacity: 0, y: 12 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        NOT JUST IMAGING
      </motion.div>
      <motion.h2
        className="font-display font-bold leading-[1.05] text-[6cqmin]"
        style={{ color: '#0b1220' }}
        initial={{ opacity: 0, y: 16 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        Lab reports too.
      </motion.h2>
      <motion.p
        className="font-display leading-snug text-[2.9cqmin] mt-[1.8cqh] max-w-[94%]"
        style={{ color: '#475569' }}
        initial={{ opacity: 0, y: 14 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        MIKA reads your blood work the same way. Every value, explained in plain language.
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
          {caption}
          <div className="w-[90cqw] h-[42cqh]">
            <LabFrame src={labResult} label="mika · lab report" delay={0.15} />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-row items-center gap-[4cqw] px-[6cqw] py-[7cqh]">
          <div className="w-[32cqw] shrink-0">{caption}</div>
          <div className="relative flex-1 h-[64cqh]">
            <div className="absolute right-0 top-[8cqh] w-[44cqw] h-[40cqh] opacity-95">
              <LabFrame src={labValues} label="mika · the numbers" delay={0.3} />
            </div>
            <div className="absolute left-0 bottom-[6cqh] w-[48cqw] h-[44cqh]">
              <LabFrame src={labResult} label="mika · lab report" delay={0.15} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
