import type { CSSProperties } from "react";

/** خلفية المتجر والمنتج — نمط مضمَّن لتفادي أي فقد لقاعدة CSS في الإنتاج */
export const catalogMainSurfaceStyle: CSSProperties = {
  minHeight: "100dvh",
  backgroundColor: "#dfd4c4",
  backgroundImage:
    "linear-gradient(180deg, rgba(11, 22, 40, 0.2) 0%, rgba(246, 244, 239, 0.95) 26%, rgba(237, 228, 214, 0.98) 58%, rgb(226, 216, 200) 100%)",
};
