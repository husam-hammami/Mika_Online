import { ProductScene } from '../parts/ProductScene';

export function SceneReading() {
  return (
    <ProductScene
      src={`${import.meta.env.BASE_URL}footage/clip_reading.mp4`}
      stepIndex={1}
      eyebrow="STEP 02"
      headline="MIKA reads all of it."
      sub="Every image, measurement, and lab value, gone through with care."
    />
  );
}
