import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { useFormat } from './FormatContext';
import { SceneLogoIn } from './video_scenes/SceneLogoIn';
import { SceneUpload } from './video_scenes/SceneUpload';
import { SceneReading } from './video_scenes/SceneReading';
import { SceneAnswer } from './video_scenes/SceneAnswer';
import { SceneChat } from './video_scenes/SceneChat';
import { SceneLab } from './video_scenes/SceneLab';
import { SceneStory } from './video_scenes/SceneStory';
import { SceneProof } from './video_scenes/SceneProof';
import { SceneAbout } from './video_scenes/SceneAbout';
import { SceneMission } from './video_scenes/SceneMission';
import { SceneOutro } from './video_scenes/SceneOutro';

export const SCENE_DURATIONS = {
  logo: 3500,
  upload: 5000,
  reading: 5500,
  answer: 7000,
  chat: 7000,
  lab: 6500,
  story: 10500,
  proof: 8000,
  about: 9000,
  mission: 8500,
  outro: 8000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  logo: SceneLogoIn,
  upload: SceneUpload,
  reading: SceneReading,
  answer: SceneAnswer,
  chat: SceneChat,
  lab: SceneLab,
  story: SceneStory,
  proof: SceneProof,
  about: SceneAbout,
  mission: SceneMission,
  outro: SceneOutro,
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
  const format = useFormat();
  const isSquare = format === 'square';

  // Optional review aid: `?only=<sceneKey>` freezes the deck on a single scene.
  const onlyScene =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('only')
      : null;
  const activeSceneKey = onlyScene && SCENE_COMPONENTS[onlyScene] ? onlyScene : currentSceneKey;

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = activeSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  const stageStyle: React.CSSProperties = isSquare
    ? { width: 'min(100vw, 100vh)', height: 'min(100vw, 100vh)', containerType: 'size' }
    : {
        width: 'min(100vw, calc(100vh * 16 / 9))',
        height: 'min(100vh, calc(100vw * 9 / 16))',
        containerType: 'size',
      };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black overflow-hidden">
      <div className="relative overflow-hidden bg-[#05070d] text-white" style={stageStyle}>
        <AnimatePresence mode="popLayout">
          {SceneComponent && <SceneComponent key={activeSceneKey} />}
        </AnimatePresence>

        <audio
          ref={audioRef}
          src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
          preload="auto"
          autoPlay
          muted={muted}
        />
      </div>
    </div>
  );
}
