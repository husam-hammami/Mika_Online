import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4_Answer() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 3000),
      setTimeout(() => setPhase(3), 5000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-[#020617]" />

      {/* Main product shot - THE money shot */}
      <motion.div 
        className="absolute w-[90vw] h-[85vh] rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_100px_rgba(16,185,129,0.3)]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <img src={`${import.meta.env.BASE_URL}product/answer_brain.png`} className="w-full h-full object-cover object-top" />
      </motion.div>

      {/* Callouts */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Callout 1: Headline */}
        <motion.div 
          className="absolute top-[25vh] left-[5vw] bg-background/90 backdrop-blur-md border border-white/10 p-6 rounded-xl max-w-[30vw] shadow-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <h3 className="font-display font-bold text-[2vw] text-white leading-tight">
            One clear headline.
          </h3>
          <p className="text-[1.2vw] text-white/70 mt-2">
            No medical jargon required.
          </p>
        </motion.div>

        {/* Callout 2: Proof */}
        <motion.div 
          className="absolute top-[45vh] right-[5vw] bg-background/90 backdrop-blur-md border border-white/10 p-6 rounded-xl max-w-[25vw] shadow-2xl"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <h3 className="font-display font-bold text-[2vw] text-white leading-tight">
            Visual proof.
          </h3>
          <p className="text-[1.2vw] text-white/70 mt-2">
            Normal vs Abnormal comparisons.
          </p>
        </motion.div>

        {/* Callout 3: Toggle */}
        <motion.div 
          className="absolute bottom-[10vh] left-[35vw] bg-background/90 backdrop-blur-md border border-white/10 p-6 rounded-xl max-w-[30vw] shadow-2xl text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <h3 className="font-display font-bold text-[1.8vw] text-white leading-tight text-primary">
            Plain language ↔ Clinician
          </h3>
          <p className="text-[1.2vw] text-white/70 mt-2">
            Switch views instantly.
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
}
