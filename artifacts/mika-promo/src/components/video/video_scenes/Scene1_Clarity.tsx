import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1_Clarity() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1 }}
    >
      {/* Background */}
      <motion.img 
        src={`${import.meta.env.BASE_URL}assets/mri_scan.jpg`}
        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 2 }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="text-primary text-[2vw] font-bold tracking-[0.2em] uppercase mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Introducing
        </motion.div>
        
        <motion.h1 
          className="font-display text-[12vw] font-black tracking-tighter text-white leading-none mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1, type: "spring", stiffness: 100 }}
        >
          MIKA
        </motion.h1>

        <motion.p
          className="text-[3vw] text-white/80 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1 }}
        >
          Clinical Imaging Intelligence.
        </motion.p>
      </div>
    </motion.div>
  );
}
