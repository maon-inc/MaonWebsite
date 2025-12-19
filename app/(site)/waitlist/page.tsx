import DotsCanvas from "@/components/motion/DotsCanvas";
import WaitlistDots from "@/components/sections/Waitlist/WaitlistDots";
import Waitlist from "@/components/sections/Waitlist/Waitlist";

export default function WaitlistPage() {
  return (
    <DotsCanvas count={1200} colorAccent="#97CEE7">
      <WaitlistDots>
        <Waitlist />
      </WaitlistDots>
    </DotsCanvas>
  );
}
