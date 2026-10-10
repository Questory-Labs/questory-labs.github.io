import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
export const DESKTOP_QUERY = "(min-width: 900px)";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Pinned sections refresh before everything else so triggers further down the page
 * measure their positions with the pin spacing already in place.
 */
export const PIN_PRIORITY = 10;

type Cleanup = () => void;

let lenis: Lenis | null = null;

/** Smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis stay frame-locked. */
function initSmoothScroll(): Cleanup {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(raf);
    lenis?.destroy();
    lenis = null;
  };
}

/** Pause/resume page scrolling (e.g. while a modal dialog is open). */
export function setScrollLocked(locked: boolean): void {
  if (locked) lenis?.stop();
  else lenis?.start();
}

/** Same-page anchor links: smooth scroll that honours each target's `scroll-margin-top` (Lenis reads it itself). */
function initAnchors(): void {
  document.addEventListener("click", (e) => {
    const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = decodeURIComponent(link.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target);
    else target.scrollIntoView();
    history.pushState(null, "", `#${id}`);
  });
}

/** Custom cursor, hover states, magnetic buttons and `[data-tilt]` mouse tilt. */
function initPointer(): Cleanup {
  const cleanups: Cleanup[] = [];
  const root = document.documentElement;
  const dot = document.querySelector<HTMLElement>(".qs-cdot");
  const ring = document.querySelector<HTMLElement>(".qs-cring");
  const label = document.querySelector<HTMLElement>(".qs-cring-label");

  if (dot && ring) {
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3" });
    let shown = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      if (!shown) {
        shown = true;
        root.classList.add("qs-cursor-on");
        gsap.to([dot, ring], { opacity: 1, duration: 0.4 });
      }
    };
    const onLeave = () => {
      shown = false;
      root.classList.remove("qs-cursor-on");
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };
    const interactive = (e: Event) =>
      (e.target as Element | null)?.closest?.("a, button, label, summary") ?? null;
    const onOver = (e: PointerEvent) => {
      const el = interactive(e);
      if (!el) return;
      const view = el.hasAttribute("data-cursor-view");
      gsap.to(ring, {
        scale: view ? 2.4 : 2,
        backgroundColor: view ? "#f2efe8" : "rgba(0,0,0,0)",
        duration: 0.45,
        ease: "power3",
      });
      if (label) gsap.to(label, { opacity: view ? 1 : 0, duration: 0.3 });
    };
    const onOut = (e: PointerEvent) => {
      if (!interactive(e)) return;
      gsap.to(ring, { scale: 1, backgroundColor: "rgba(0,0,0,0)", duration: 0.45, ease: "power3" });
      if (label) gsap.to(label, { opacity: 0, duration: 0.2 });
    };

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    cleanups.push(() => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      root.classList.remove("qs-cursor-on");
    });
  }

  gsap.utils.toArray<HTMLElement>(".qs-mag").forEach((el) => {
    const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.35);
      y((e.clientY - r.top - r.height / 2) * 0.45);
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)" });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    cleanups.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    });
  });

  const tilts = gsap.utils.toArray<HTMLElement>("[data-tilt]");
  if (tilts.length) {
    gsap.set(tilts, { transformPerspective: 1400 });
    const rx = gsap.quickTo(tilts, "rotationX", { duration: 0.9, ease: "power3" });
    const ry = gsap.quickTo(tilts, "rotationY", { duration: 0.9, ease: "power3" });
    const onTilt = (e: PointerEvent) => {
      ry((e.clientX / window.innerWidth - 0.5) * 9);
      rx(-(e.clientY / window.innerHeight - 0.5) * 7);
    };
    window.addEventListener("pointermove", onTilt);
    cleanups.push(() => window.removeEventListener("pointermove", onTilt));
  }

  return () => cleanups.forEach((fn) => fn());
}

/**
 * Modal dialogs render in the top layer, above the fixed cursor. Move the cursor into the dialog
 * while it is open so it stays visible, and back out when it closes.
 */
export function cursorInto(container: HTMLElement | null): void {
  const host = container ?? document.body;
  document.querySelectorAll(".qs-cdot, .qs-cring").forEach((el) => host.prepend(el));
}

/** Masked per-character intro for headings rendered with SplitText.astro. */
export function charsIn(selector: string): gsap.core.Tween {
  return gsap.from(`${selector} .qs-char`, {
    yPercent: 118,
    rotate: 10,
    duration: 1.4,
    stagger: 0.028,
    ease: "expo.out",
  });
}

/**
 * Shared page chrome: smooth scrolling, nav drop-in, scroll progress bar, `.qs-up` reveals and
 * pointer effects. Pages add their own timelines; pinned ones should pass `refreshPriority:
 * PIN_PRIORITY`. Everything except anchor handling is skipped under reduced motion.
 */
export function initChrome(): void {
  initAnchors();
  const mm = gsap.matchMedia();
  mm.add({ motion: MOTION_QUERY, fine: FINE_POINTER_QUERY }, (ctx) => {
    const { motion, fine } = ctx.conditions as { motion: boolean; fine: boolean };
    if (!motion) return;

    const stopSmooth = initSmoothScroll();
    gsap.from(".qs-nav-inner", { yPercent: -130, opacity: 0, duration: 1.1, ease: "expo.out" });
    gsap.to(".qs-progress", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });
    gsap.utils.toArray<HTMLElement>(".qs-up").forEach((el) => {
      gsap.from(el, {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 86%" },
      });
    });

    const stopPointer = fine ? initPointer() : undefined;
    return () => {
      stopPointer?.();
      stopSmooth();
    };
  });
  // Image boxes are reserved by width/height attributes; only late web fonts move layout.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/** Infinite marquee whose speed and skew react to scroll velocity. */
export function velocityMarquee(
  tracks: { el: Element; reverse?: boolean }[],
  trigger: Element,
  duration = 30,
): Cleanup {
  const tweens = tracks.map(({ el, reverse }) => {
    const tween = reverse
      ? gsap.fromTo(el, { xPercent: -50 }, { xPercent: 0, duration, ease: "none", repeat: -1 })
      : gsap.to(el, { xPercent: -50, duration, ease: "none", repeat: -1 });
    // Start deep into the repeat so a negative timeScale can run backwards indefinitely.
    tween.totalTime(tween.duration() * 200);
    return tween;
  });
  const skews = tracks.map(({ el }) => gsap.quickSetter(el, "skewX", "deg"));
  let boost = 0;
  let dir = 1;
  ScrollTrigger.create({
    trigger,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      boost = Math.min(Math.abs(self.getVelocity()) / 220, 12);
      dir = self.direction;
    },
  });
  const tick = () => {
    boost *= 0.92;
    tweens.forEach((t) => t.timeScale(dir * (1 + boost)));
    skews.forEach((set) => set(-dir * boost * 1.1));
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}
