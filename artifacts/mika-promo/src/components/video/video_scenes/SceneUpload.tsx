import { ProductScene } from '../parts/ProductScene';

export function SceneUpload() {
  return (
    <ProductScene
      src={`${import.meta.env.BASE_URL}footage/clip_upload.mp4`}
      stepIndex={0}
      eyebrow="STEP 01"
      headline="Bring your scan or report."
      sub="Any MRI, CT, or X-ray, or your blood work. You don’t need to know what you’re looking at."
    />
  );
}
