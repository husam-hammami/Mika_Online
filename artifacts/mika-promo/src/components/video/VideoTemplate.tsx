import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene0_Fear } from './video_scenes/Scene0_Fear';
import { Scene1_Clarity } from './video_scenes/Scene1_Clarity';
import { Scene2_Upload } from './video_scenes/Scene2_Upload';
import { Scene3_Reading } from './video_scenes/Scene3_Reading';
import { Scene4_Answer } from './video_scenes/Scene4_Answer';
import { Scene5_Trust } from './video_scenes/Scene5_Trust';
import { Scene6_Outro } from './video_scenes/Scene6_Outro';

export const SCENE_DURATIONS = {
  fear: 6000,
  clarity: 6000,
  upload: 7000,
  reading: 8000,
  answer: 9000,
  trust: 10000,
  outro: 8000
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  fear: Scene0_Fear,
  clarity: Scene1_Clarity,
  upload: Scene2_Upload,
  reading: Scene3_Reading,
  answer: Scene4_Answer,
  trust: Scene5_Trust,
  outro: Scene6_Outro,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  return (
    <div className="w-full h-screen overflow-hidden relative bg-[#020617] text-white">

      {/* Persistent Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }}
          animate={{
            x: ['-20%', '10%', '-10%'],
            y: ['-20%', '20%', '-10%'],
            scale: [1, 1.2, 0.9]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[60vw] h-[60vw] right-0 bottom-0 rounded-full blur-[100px] opacity-15"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }}
          animate={{
            x: ['10%', '-20%', '0%'],
            y: ['10%', '-10%', '0%']
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 opacity-5 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        ></div>
      </div>

      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </div>
  );
}
