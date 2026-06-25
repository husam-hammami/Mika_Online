import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5_Trust() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500),
      setTimeout(() => setPhase(2), 3000),
      setTimeout(() => setPhase(3), 4500),
      setTimeout(() => setPhase(4), 6500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const items = [
    { title: "Private by design", desc: "Your scans never leave you securely." },
    { title: "Decision support", desc: "Reviewed by your doctor — not a diagnosis." },
    { title: "Powered by Claude", desc: "State-of-the-art medical intelligence." },
    { title: "100% Free", desc: "Because clarity shouldn't cost a thing." },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col justify-center px-[10vw] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 1 }}
    >
      <div className="grid grid-cols-2 gap-[4vw] relative z-10">
        <div className="flex flex-col justify-center gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              animate={phase >= i ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <h3 className="font-display text-[2.5vw] font-bold text-white flex items-center gap-4">
                <span className="text-primary text-[2vw]">✦</span> {item.title}
              </h3>
              <p className="text-[1.5vw] text-white/60 pl-[3.5vw] mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="relative h-full flex flex-col justify-center">
          <motion.div
            className="bg-muted/50 backdrop-blur-xl border border-white/10 p-10 rounded-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <p className="text-[1.8vw] text-white/90 leading-relaxed italic font-light">
              "Built after my own emergency surgeries, because no one should face a frightening scan feeling confused and alone."
            </p>
            <p className="text-[1.2vw] text-white/50 mt-6 uppercase tracking-wider font-bold">
              — Husam Hammami, Founder
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
