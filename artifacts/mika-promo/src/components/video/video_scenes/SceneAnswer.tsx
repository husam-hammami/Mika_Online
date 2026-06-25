import { ProductScene } from '../parts/ProductScene';

export function SceneAnswer() {
  return (
    <ProductScene
      src={`${import.meta.env.BASE_URL}footage/clip_answer.mp4`}
      stepIndex={2}
      eyebrow="STEP 03"
      headline="Then it explains."
      sub="In plain language, with the proof shown right beside it. Your doctor stays part of every step."
    />
  );
}
