import DotsCanvas from "@/components/motion/DotsCanvas";
import WaitlistDots from "@/components/sections/Waitlist/WaitlistDots";
import Waitlist from "@/components/sections/Waitlist/Waitlist";

// Force dynamic rendering since this page uses Convex mutations
export const dynamic = "force-dynamic";

export default function WaitlistPage() {
  return (
    <DotsCanvas
      count={1200}
      colorAccent="#97CEE7"
      initialDurationMs={1500}
      transitionDurationMs={500}
      morphSpeed={0.4}
    >
      <WaitlistDots>
        <Waitlist />
      </WaitlistDots>
    </DotsCanvas>
  );
}
