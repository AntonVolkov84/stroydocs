import { useState } from "react";
import "./ImageToggle.css";

export default function ImageToggle({ src, alt }: { src: string; alt?: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div
      className={isFullscreen ? "image-wrapper fullscreen" : "image-wrapper"}
      onClick={() => setIsFullscreen(!isFullscreen)}
    >
      <img src={src} alt={alt || ""} className="image" />
    </div>
  );
}
