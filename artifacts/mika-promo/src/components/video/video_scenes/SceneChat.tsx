import { ProductScene } from '../parts/ProductScene';

export function SceneChat() {
  return (
    <ProductScene
      src={`${import.meta.env.BASE_URL}footage/clip_chat.mp4`}
      stepIndex={3}
      eyebrow="STEP 04"
      headline="Then you can just ask."
      sub="Ask MIKA anything about your scan and get a clear answer back, in your own words."
    />
  );
}
