import { motion } from 'framer-motion';

interface MikaLogoProps {
  /** rendered height of the helix mark (cq units) */
  height?: string;
  /** show the MIKA wordmark beside the mark */
  wordmark?: boolean;
  /** add a dark legibility shadow for light backgrounds */
  onLight?: boolean;
  /** animate the helix turning on its own axis */
  spin?: boolean;
  /** stack the wordmark under the mark (better for square / tall frames) */
  stacked?: boolean;
}

/**
 * The MIKA lockup: the helix mark gently turning on its own vertical axis,
 * with the static wordmark beside it. No added glow fields — the animation
 * comes from the mark itself. Self-contained (public PNGs) so it exports cleanly.
 */
export function MikaLogo({
  height = '30cqmin',
  wordmark = true,
  onLight = false,
  spin = true,
  stacked = false,
}: MikaLogoProps) {
  const helixSrc = `${import.meta.env.BASE_URL}brand/${
    onLight ? 'mika_helix_ink.png' : 'mika_helix.png'
  }`;
  const typeSrc = `${import.meta.env.BASE_URL}brand/${
    onLight ? 'mika_type_ink.png' : 'mika_type.png'
  }`;
  const markShadow = onLight
    ? 'drop-shadow(0 1px 2px rgba(5,7,13,0.18))'
    : 'drop-shadow(0 0 22px rgba(30,107,255,0.5))';
  const typeShadow = onLight
    ? 'none'
    : 'drop-shadow(0 0 18px rgba(30,107,255,0.4))';

  return (
    <div
      className={`flex pointer-events-none ${
        stacked ? 'flex-col items-center' : 'items-center'
      }`}
      style={{ gap: `calc(${height} * ${stacked ? 0.12 : 0.04})` }}
    >
      <motion.img
        src={helixSrc}
        alt=""
        className="object-contain"
        style={{ height, transformPerspective: 900, filter: markShadow }}
        animate={spin ? { rotateY: [-32, 32, -32] } : undefined}
        transition={
          spin ? { duration: 5.5, repeat: Infinity, ease: 'easeInOut' } : undefined
        }
      />
      {wordmark && (
        <img
          src={typeSrc}
          alt="MIKA"
          className="object-contain"
          style={{ height: `calc(${height} * 0.28)`, filter: typeShadow }}
        />
      )}
    </div>
  );
}
