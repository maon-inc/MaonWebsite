 "use client";
 
 import { useEffect, useRef } from "react";
 import { getScrollContainer, subscribe } from "@/motion/engine";
 import DotsScene from "@/components/motion/DotsScene";
 
 export default function DayAutoEffort() {
   const containerRef = useRef<HTMLDivElement>(null);
   const sectionRef = useRef<HTMLElement | null>(null);
 
   const lineRef = useRef<HTMLParagraphElement>(null);
   const effortSpanRef = useRef<HTMLSpanElement>(null);
  const colorsRef = useRef<{
    from: { r: number; g: number; b: number };
    to: { r: number; g: number; b: number };
  } | null>(null);
 
   useEffect(() => {
     const container = containerRef.current;
     if (!container) return;
 
    const section = sectionRef.current ?? (container.closest("section") as HTMLElement | null);
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

    const mix = (
      a: { r: number; g: number; b: number },
      b: { r: number; g: number; b: number },
      t: number
    ) => ({
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t,
    });

    // Function to read and compute colors from CSS variables
    const updateColors = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      // Start visibly "greyed out" (lighter than --text-secondary in light theme).
      const baseGray = parseCssColorToRgb(
        rootStyles.getPropertyValue("--dots-color-gray")
      );
      // Exaggerate: lift gray towards white so it reads clearly as "greyed out".
      const fromFloat = mix(baseGray, { r: 255, g: 255, b: 255 }, 0.55);
      const from = {
        r: Math.round(fromFloat.r),
        g: Math.round(fromFloat.g),
        b: Math.round(fromFloat.b),
      };
      const to = parseCssColorToRgb(rootStyles.getPropertyValue("--text-primary"));
      colorsRef.current = { from, to };
      return { from, to };
    };

    // Initial color setup
    const { from } = updateColors();
    // Apply the starting color immediately (so it doesn't depend on scroll tick).
    if (effortSpanRef.current) {
      effortSpanRef.current.style.color = `rgb(${from.r}, ${from.g}, ${from.b})`;
    }
    
    // Listen for theme changes (color-scheme preference)
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleColorSchemeChange = () => {
      updateColors();
    };
    colorSchemeQuery.addEventListener("change", handleColorSchemeChange);

     const unsubscribe = subscribe((state) => {
       const scrollContainer = getScrollContainer();
       const viewportH = state.viewportH;
 
       const rect = section.getBoundingClientRect();
       const elementHeight = rect.height;
 
       // Convert element top into the same coordinate space as state.scrollY.
       let elementTop = rect.top + (scrollContainer ? 0 : window.scrollY);
       if (scrollContainer) {
         const rootRect = scrollContainer.getBoundingClientRect();
         elementTop = rect.top - rootRect.top + scrollContainer.scrollTop;
       }
 
       const scrollRange = elementHeight - viewportH;
       if (scrollRange <= 1) return;
 
       const raw = (state.scrollY - elementTop) / scrollRange;
       const progress = Math.max(0, Math.min(1, raw));
 
       // Line fades in quickly at the start of this section.
       const lineT = Math.max(0, Math.min(1, progress / 0.12));
       if (lineRef.current) lineRef.current.style.opacity = String(lineT);
 
       // "without your effort" darkens much faster than Problem.tsx.
       // Darken over a short scroll window near the beginning so continued scroll resolves it fast.
      const darkenStart = 0.03;
      const darkenWindow = 0.08;
       const t = Math.max(
         0,
         Math.min(1, (progress - darkenStart) / Math.max(1e-6, darkenWindow))
       );
      // Exaggerate: stronger ease so it "snaps" darker quickly as you scroll.
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const colors = colorsRef.current;
      if (effortSpanRef.current && colors) {
        const r = Math.round(colors.from.r + (colors.to.r - colors.from.r) * eased);
        const g = Math.round(colors.from.g + (colors.to.g - colors.from.g) * eased);
        const b = Math.round(colors.from.b + (colors.to.b - colors.from.b) * eased);
        effortSpanRef.current.style.color = `rgb(${r}, ${g}, ${b})`;
      }
     });
 
     return () => {
       unsubscribe();
       colorSchemeQuery.removeEventListener("change", handleColorSchemeChange);
     };
   }, []);
 
   return (
    <section ref={sectionRef} className="relative grid h-[200vh]">
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
               <span ref={effortSpanRef} style={{ color: "var(--dots-color-gray)" }}>
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
