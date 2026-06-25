import { motion } from 'framer-motion';

export function Scene6_Outro() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      <div className="absolute inset-0 bg-background" />
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
      >
        <div className="w-[80vw] h-[80vw] rounded-full border border-primary/20 scale-150" />
        <div className="absolute w-[60vw] h-[60vw] rounded-full border border-primary/40 scale-125" />
        <div className="absolute w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-3xl" />
      </motion.div>

      <div className="relative z-10 text-center">
        <motion.h1 
          className="font-display text-[10vw] font-black tracking-tighter text-white leading-none mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          MIKA
        </motion.h1>
        
        <motion.p
          className="text-[2.5vw] text-white/80 font-light tracking-wide mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          Clinical Imaging Intelligence
        </motion.p>

        <motion.div
          className="px-8 py-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-md inline-block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
          <p className="text-[1.8vw] font-medium text-white">
            From scan to <span className="text-primary">clear answers.</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
