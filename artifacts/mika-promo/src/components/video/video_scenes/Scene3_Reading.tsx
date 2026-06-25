import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3_Reading() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 4000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-background" />

      <div className="relative z-10 w-full text-center mb-[40vh]">
        <motion.h2 
          className="font-display text-[3.5vw] font-bold text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Organizing images, measurements, and proof.
        </motion.h2>
      </div>

      <div className="absolute bottom-[10vh] w-[120vw] flex gap-[2vw] justify-center items-center">
        {/* Brain */}
        <motion.div 
          className="w-[30vw] h-[40vh] rounded-xl overflow-hidden border border-white/10 shadow-2xl"
          initial={{ opacity: 0, y: 100, rotate: -5 }}
          animate={phase >= 1 ? { opacity: 1, y: 0, rotate: -5 } : { opacity: 0, y: 100, rotate: -5 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <img src={`${import.meta.env.BASE_URL}product/reading_brain.png`} className="w-full h-full object-cover" />
        </motion.div>

        {/* Chest */}
        <motion.div 
          className="w-[35vw] h-[45vh] rounded-xl overflow-hidden border border-white/10 shadow-2xl z-10"
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={phase >= 2 ? { opacity: 1, y: -20, scale: 1.05 } : { opacity: 0, y: 100, scale: 0.9 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <img src={`${import.meta.env.BASE_URL}product/reading_chest.png`} className="w-full h-full object-cover" />
        </motion.div>

        {/* Spine */}
        <motion.div 
          className="w-[30vw] h-[40vh] rounded-xl overflow-hidden border border-white/10 shadow-2xl"
          initial={{ opacity: 0, y: 100, rotate: 5 }}
          animate={phase >= 3 ? { opacity: 1, y: 0, rotate: 5 } : { opacity: 0, y: 100, rotate: 5 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <img src={`${import.meta.env.BASE_URL}product/reading_spine.png`} className="w-full h-full object-cover" />
        </motion.div>
      </div>
    </motion.div>
  );
}
