export type CanvasElement = {
  id: string;
  page: "cover" | "names" | "story" | "details" | "gifts" | "guestbook";
  type: "text" | "ornament" | "photo" | "rect" | "circle" | "line";
  text: string;
  image_url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font_size: number;
  color: string;
  rotation: number;
  effect: "none" | "shadow" | "glow" | "outline";
  frame: "none" | "round" | "oval" | "ornate";
  font_family: "serif" | "sans";
  font_style: "normal" | "bold" | "italic" | "bold italic";
  opacity: number;
};
