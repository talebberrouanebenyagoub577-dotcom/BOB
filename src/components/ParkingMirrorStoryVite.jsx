import { ProductPdpStoryVite } from "./ProductPdpStoryVite";
import { PARKING_MIRROR_STORY_BLOCKS } from "../data/parkingMirrorPdp";

export function ParkingMirrorStoryVite() {
  return (
    <ProductPdpStoryVite
      title="ليش مرايا الركن الدقيقة تفرق في قيادتك؟"
      blocks={PARKING_MIRROR_STORY_BLOCKS}
      squareMedia
    />
  );
}
