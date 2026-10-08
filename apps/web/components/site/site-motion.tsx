"use client";
import { useEffect, useRef, type ReactNode } from "react";
export default function SiteMotion({ children, className }: { children: ReactNode; className: string }) {
 const ref = useRef<HTMLDivElement>(null);
 useEffect(() => {
  const root = ref.current;
  if (!root || !("IntersectionObserver" in window)) return;
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let observer: IntersectionObserver | undefined;
  const refresh = () => {
   observer?.disconnect();
   delete root.dataset.motion;
   if (preference.matches) return;
   observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
     (entry.target as HTMLElement).dataset.revealed = "true";
     observer?.unobserve(entry.target);
    }
   }, { threshold: 0.08 });
   const elements = root.querySelectorAll<HTMLElement>("[data-reveal]");
   for (const el of elements) {
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) el.dataset.revealed = "true";
    else if (!el.dataset.revealed) observer.observe(el);
   }
   root.dataset.motion = "ready";
  };
  refresh(); preference.addEventListener("change", refresh);
  return () => { observer?.disconnect(); preference.removeEventListener("change", refresh); delete root.dataset.motion; };
 }, []);
 return <div ref={ref} className={className}>{children}</div>;
}
