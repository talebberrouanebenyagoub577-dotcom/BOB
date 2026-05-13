import { ProductPdpStoryVite } from "./ProductPdpStoryVite";
import { SEAT_ORGANIZER_STORY_BLOCKS } from "../data/seatOrganizerPdp";

export function SeatOrganizerStoryVite() {
  return (
    <ProductPdpStoryVite
      title="ليش المنظّم الذكي للمقعد يستحق مكاناً دائماً في سيارتك؟"
      blocks={SEAT_ORGANIZER_STORY_BLOCKS}
    />
  );
}
