 "use client";
 
 import { useEffect, useRef } from "react";
 import { getScrollContainer, subscribe } from "@/motion/engine";
 import { measureElement } from "@/motion/measures";
 import { observeResize } from "@/motion/observe";
 import DotsScene from "@/components/motion/DotsScene";
 
 export default function DayAutoEffort() {
   const containerRef = useRef<HTMLDivElement>(null);
   const sectionTopRef = useRef(0);
   const sectionHeightRef = useRef(1);
   const lastProgressRef = useRef(-1);
 
   const lineRef = useRef<HTMLParagraphElement>(null);
   const effortSpanRef = useRef<HTMLSpanElement>(null);
  const colorsRef = useRef<{
    from: { r: number; g: number; b: number };
    to: { r: number; g: number; b: number };
  } | null>(null);
 
   useEffect(() => {
     const container = containerRef.current;
     if (!container) return;
 
    const section = container.closest("section") as HTMLElement | null;
     if (!section) return;
 
    const parseCssColorToRgb = (value: string) => {
      const v = value.trim();
      // #RRGGBB
      const hex = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(v);
      if (hex) {
        return {
          r: parseInt(hex[1], 16),
          g: parseInt(hex[2], 16),
          b: parseInt(hex[3], 16),
        };
      }
      // rgb(r,g,b)
      const rgb =
        /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/i.exec(
          v
        );
      if (rgb) {
        return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
      }
      // Fallbacks from globals.css
      return { r: 82, g: 82, b: 82 }; // --text-secondary default (#525252)
    };

    const rootStyles = getComputedStyle(document.documentElement);
    const from = parseCssColorToRgb(rootStyles.getPropertyValue("--text-secondary"));
    const to = parseCssColorToRgb(rootStyles.getPropertyValue("--text-primary"));
    colorsRef.current = { from, to };

     const recompute = () => {
       const { elementTop, elementHeight } = measureElement(
         section,
         getScrollContainer()
       );
       sectionTopRef.current = elementTop;
       sectionHeightRef.current = Math.max(1, elementHeight);
     };
 
     recompute();
     const stopResize = observeResize(section, recompute);
 
     const unsubscribe = subscribe((state) => {
       const viewportH = state.viewportH;
       const scrollStart = sectionTopRef.current;
       const scrollEnd = sectionTopRef.current + sectionHeightRef.current - viewportH;
       const scrollRange = scrollEnd - scrollStart;
 
       if (scrollRange <= 0) return;
 
       const raw = (state.scrollY - scrollStart) / scrollRange;
       const progress = Math.max(0, Math.min(1, raw));
 
       // Avoid extra DOM writes when progress doesn't change meaningfully.
       if (Math.abs(progress - lastProgressRef.current) < 0.003) return;
       lastProgressRef.current = progress;
 
       // Line fades in quickly at the start of this section.
       const lineT = Math.max(0, Math.min(1, progress / 0.12));
       if (lineRef.current) lineRef.current.style.opacity = String(lineT);
 
       // "without your effort" darkens much faster than Problem.tsx.
       // Darken over a short scroll window near the beginning so continued scroll resolves it fast.
       const darkenStart = 0.08;
       const darkenWindow = 0.16;
       const t = Math.max(
         0,
         Math.min(1, (progress - darkenStart) / Math.max(1e-6, darkenWindow))
       );
       const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      const colors = colorsRef.current;
      if (effortSpanRef.current && colors) {
        const r = Math.round(colors.from.r + (colors.to.r - colors.from.r) * eased);
        const g = Math.round(colors.from.g + (colors.to.g - colors.from.g) * eased);
        const b = Math.round(colors.from.b + (colors.to.b - colors.from.b) * eased);
        effortSpanRef.current.style.color = `rgb(${r}, ${g}, ${b})`;
      }
     });
 
     return () => {
       stopResize();
       unsubscribe();
     };
   }, []);
 
   return (
     <section className="relative grid h-[200vh]">
       <div className="pointer-events-none col-start-1 row-start-1">
         <DotsScene scatter className="h-[200vh]" morphSpeedMult={2} />
       </div>
 
       <div className="sticky top-0 h-screen col-start-1 row-start-1">
        {/* 50vh overlay, centered on screen */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[50vh] flex items-center justify-center">
           <div
             ref={containerRef}
             className="w-full max-w-[900px] px-6 text-center"
           >
             <p
               ref={lineRef}
               className="text-m-merriweather-30-regular text-[var(--text-primary)]"
               style={{ opacity: 0 }}
             >
               all of this happens automatically,{" "}
               <span ref={effortSpanRef} style={{ color: "var(--text-secondary)" }}>
                 without your effort
               </span>
               .
             </p>
           </div>
         </div>
       </div>
     </section>
   );
 }
