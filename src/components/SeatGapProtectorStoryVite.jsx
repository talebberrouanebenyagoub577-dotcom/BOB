import { ProductPdpStoryVite } from "./ProductPdpStoryVite";
import { SEATGAP_STORY_BLOCKS } from "../data/seatgapPdp";

export function SeatGapProtectorStoryVite() {
  return (
    <ProductPdpStoryVite
      title="من الصورة إلى التفاصيل: كيف حامي الفراغ يخدمك يومياً؟"
      blocks={SEATGAP_STORY_BLOCKS}
    />
  );
}
