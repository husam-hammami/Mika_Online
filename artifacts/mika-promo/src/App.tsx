import VideoWithControls from "@/components/video/VideoWithControls";
import { FormatContext, resolveFormatFromUrl } from "@/components/video/FormatContext";

export default function App() {
  const format = resolveFormatFromUrl();
  return (
    <FormatContext.Provider value={format}>
      <VideoWithControls />
    </FormatContext.Provider>
  );
}
