import type { ParkingMirrorStoryBlock } from "@/data/parkingMirrorPdp";
import { ProductPdpZigzag } from "@/components/ProductPdpZigzag";

interface Props {
  blocks: ParkingMirrorStoryBlock[];
}

export function ParkingMirrorStory({ blocks }: Props) {
  return (
    <ProductPdpZigzag
      title="ليش مرايا الركن الدقيقة تفرق في قيادتك؟"
      ariaLabel="تفاصيل طقم مرايا الاصطفاف الدقيقة"
      blocks={blocks}
    />
  );
}
