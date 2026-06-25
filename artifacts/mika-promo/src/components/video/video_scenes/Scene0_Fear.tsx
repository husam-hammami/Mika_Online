import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene0_Fear() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1 }}
    >
      <motion.img 
        src={`${import.meta.env.BASE_URL}assets/waiting.jpg`}
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        initial={{ scale: 1 }}
        animate={{ scale: 1.15 }}
        transition={{ duration: 10, ease: 'linear' }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 text-center px-12 max-w-[80vw]">
        <motion.h2 
          className="font-display text-[4vw] font-light tracking-tight text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          The scan is done.
        </motion.h2>
        
        <motion.h2 
          className="font-display text-[5vw] font-bold tracking-tight text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          But the <span className="text-red-400">answers aren't.</span>
        </motion.h2>
      </div>
    </motion.div>
  );
}
