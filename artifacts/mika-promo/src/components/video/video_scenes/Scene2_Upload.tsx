import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2_Upload() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background to-muted" />

      <div className="w-full h-full flex items-center justify-between px-[10vw]">
        <div className="w-[40%] relative z-10">
          <motion.h2 
            className="font-display text-[4vw] font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            From scan to <br/>
            <span className="text-primary">clear answers.</span>
          </motion.h2>
          
          <motion.p
            className="text-[1.5vw] text-white/70"
            initial={{ opacity: 0 }}
            animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            Upload any MRI, CT, or X-ray.<br/>
            MIKA reads it all.
          </motion.p>
        </div>

        <motion.div 
          className="w-[50%] h-[70vh] relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)] border border-white/10"
          initial={{ opacity: 0, x: 50, rotateY: -15, perspective: 1000 }}
          animate={phase >= 2 ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 50, rotateY: -15 }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
        >
          <img 
            src={`${import.meta.env.BASE_URL}product/home_upload.png`} 
            className="w-full h-full object-cover object-top"
          />
          {phase >= 3 && (
            <motion.div 
              className="absolute inset-0 bg-primary/20 mix-blend-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
