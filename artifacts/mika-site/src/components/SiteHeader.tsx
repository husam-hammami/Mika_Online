import { useEffect, useState } from "react";

/** Smooth-scroll to the email-gate / download section, honoring reduced-motion. */
export function scrollToDownload() {
  const el = document.getElementById("download");
  if (!el) return;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
}

/**
 * Sticky top bar that stays hidden over the cinematic hero and slides in once the
 * user has scrolled past it, keeping a download CTA reachable from anywhere.
 */
export function SiteHeader() {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShown(window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        shown ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-[#05070d]/85 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="#top" aria-label="MIKA — back to top" className="flex items-center">
            <img src={`${baseUrl}/brand/mika_type.png`} alt="MIKA" className="h-4 opacity-90" />
          </a>
          <button
            type="button"
            onClick={scrollToDownload}
            className="h-9 px-5 rounded-md mika-accent-bg hover:bg-[#1a5fe6] text-white text-sm font-medium shadow-md transition-colors"
          >
            Get MIKA free
          </button>
        </div>
      </div>
    </header>
  );
}
