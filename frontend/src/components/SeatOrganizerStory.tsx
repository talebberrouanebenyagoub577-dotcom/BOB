import { SEAT_ORGANIZER_STORY_BLOCKS } from "@/data/seatOrganizerPdp";
import { ProductPdpZigzag } from "@/components/ProductPdpZigzag";

export function SeatOrganizerStory() {
  return (
    <ProductPdpZigzag
      title="ليش المنظّم الذكي للمقعد يستحق مكاناً دائماً في سيارتك؟"
      ariaLabel="تفاصيل المنظّم الذكي للمقعد الدقيق"
      blocks={SEAT_ORGANIZER_STORY_BLOCKS}
    />
  );
}
