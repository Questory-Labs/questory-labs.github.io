import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP = "(min-width: 900px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)";
const COMPACT = "(max-width: 899.98px) and (prefers-reduced-motion: no-preference)";
const RUNTIME_SECONDS = 107 * 60;
const WORDS = [
  ["played", "#bfe6dc"],
  ["heard", "#f5c6d1"],
  ["watched", "#efd9a8"],
  ["read", "#c9d1f6"],
] as const;

const all = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(selector));

function cycleWord(): () => void {
  const word = document.querySelector<HTMLElement>("[data-word]");
  if (!word) return () => {};
  let index = 0;
  const timer = window.setInterval(() => {
    index = (index + 1) % WORDS.length;
    gsap.to(word, {
      opacity: 0,
      y: -10,
      filter: "blur(6px)",
      duration: 0.3,
      onComplete: () => {
        word.textContent = WORDS[index][0];
        word.style.color = WORDS[index][1];
        gsap.fromTo(word, { opacity: 0, y: 10, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45 });
      },
    });
  }, 3000);
  return () => {
    window.clearInterval(timer);
    gsap.killTweensOf(word);
    gsap.set(word, { clearProps: "all" });
    word.textContent = WORDS[0][0];
    word.style.color = WORDS[0][1];
  };
}

function letterbox(): (self: ScrollTrigger) => void {
  const bars = all("[data-bar]");
  const active = new Set<ScrollTrigger>();
  const apply = () => {
    const on = active.size > 0 || window.scrollY < 2;
    gsap.to(bars, { scaleY: on ? 1 : 0, duration: 0.7, ease: "power3.inOut", overwrite: true });
  };
  apply();
  return (self) => {
    if (self.isActive) active.add(self);
    else active.delete(self);
    apply();
  };
}

function driftWall(hero: HTMLElement): void {
  const tweens = all("[data-row]", hero).map((row, i) =>
    gsap.fromTo(
      row,
      { xPercent: i % 2 ? -7 : 2 },
      { xPercent: i % 2 ? 2 : -7, duration: 34 + i * 5, ease: "sine.inOut", repeat: -1, yoyo: true },
    ),
  );
  ScrollTrigger.create({
    trigger: hero,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => tweens.forEach((tween) => (self.isActive ? tween.play() : tween.pause())),
  });
}

function heroScene(toggleBars: (self: ScrollTrigger) => void, signal: AbortSignal): void {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero) return;
  driftWall(hero);
  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: hero, pin: true, start: "top top", end: "+=70%", scrub: true, onToggle: toggleBars },
    })
    .to("[data-wall]", { scale: 2.5, rotateX: 0, rotateZ: 0, opacity: 0.12, duration: 1 }, 0)
    .to("[data-hero-copy]", { scale: 0.86, opacity: 0, duration: 0.6 }, 0.05);
  const wall = document.querySelector<HTMLElement>("[data-wall]");
  if (wall) tiltOnPointer(hero, wall, 4, signal);
}

function tiltOnPointer(zone: HTMLElement, target: HTMLElement, degrees: number, signal: AbortSignal): void {
  const rotate = gsap.quickTo(target, "rotationY", { duration: 0.6, ease: "power3.out" });
  zone.addEventListener(
    "pointermove",
    (event) => {
      const ratio = event.clientX / window.innerWidth - 0.5;
      rotate(ratio * degrees * 2);
    },
    { passive: true, signal },
  );
  zone.addEventListener("pointerleave", () => rotate(0), { passive: true, signal });
}

function preloadActs(): void {
  all("[data-act]").forEach((act) => {
    ScrollTrigger.create({
      trigger: act,
      start: "top 300%",
      once: true,
      onEnter: () => {
        all<HTMLImageElement>("img", act).forEach((img) => {
          img.loading = "eager";
          void img.decode().catch(() => undefined);
        });
      },
    });
  });
}

function gateFlash(): void {
  const flash = document.querySelector<HTMLElement>("[data-flash]");
  if (!flash) return;
  const fire = () => gsap.fromTo(flash, { opacity: 0.14 }, { opacity: 0, duration: 0.4, ease: "power2.out", overwrite: true });
  all("[data-act]").forEach((act) => {
    ScrollTrigger.create({ trigger: act, start: "top 40%", onEnter: fire, onEnterBack: fire });
  });
}

function trailerScene(toggleBars: (self: ScrollTrigger) => void): void {
  const section = document.querySelector<HTMLElement>("[data-trailer]");
  if (!section) return;
  const lines = all("[data-line]", section);
  const hidden = { opacity: 0, y: 34, filter: "blur(14px)" };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)", ease: "power2.out" };
  gsap.fromTo(lines[0], hidden, { ...shown, ease: "none", scrollTrigger: { trigger: section, start: "top 75%", end: "top 15%", scrub: true } });
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: section, pin: true, start: "top top", end: `+=${lines.length * 35}%`, scrub: true, onToggle: toggleBars },
  });
  lines.forEach((line, i) => {
    if (i > 0) timeline.fromTo(line, hidden, { ...shown, duration: 0.5 });
    if (i < lines.length - 1) {
      timeline.to(line, { opacity: 0, y: -34, filter: "blur(10px)", duration: 0.4, ease: "power2.in" }, "+=0.35");
    } else {
      timeline.to(line, { scale: 1.5, opacity: 0, filter: "blur(16px)", duration: 0.6, ease: "power2.in" }, "+=0.4");
    }
  });
}

function cardScene(act: HTMLElement, toggleBars: (self: ScrollTrigger) => void): void {
  const card = act.querySelector<HTMLElement>("[data-card]");
  if (!card) return;
  const pick = (name: string) => card.querySelector(`[data-card-${name}]`);
  gsap
    .timeline({ scrollTrigger: { trigger: card, start: "top 85%", end: "top 5%", scrub: true } })
    .fromTo(pick("mark"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.3 }, 0)
    .fromTo(pick("title"), { scale: 1.25 }, { scale: 1, duration: 0.75, ease: "power2.out" }, 0)
    .fromTo(
      all("[data-char]", card),
      { opacity: 0, yPercent: 70, rotate: 8 },
      { opacity: 1, yPercent: 0, rotate: 0, duration: 0.4, stagger: { amount: 0.3 }, ease: "power3.out" },
      0.05,
    )
    .fromTo(pick("accent"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.3 }, 0.5)
    .fromTo(pick("logline"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.3 }, 0.7);
  const timeline = gsap
    .timeline({ scrollTrigger: { trigger: card, pin: true, start: "top top", end: "+=60%", scrub: true, onToggle: toggleBars } })
    .to(pick("inner"), { scale: 1.16, opacity: 0, duration: 0.45, ease: "power2.in" }, 0.55);
  const sweep = card.querySelector("[data-sweep]");
  if (sweep) timeline.fromTo(sweep, { xPercent: -120 }, { xPercent: 260, duration: 0.8, ease: "none" }, 0);
}

function panScene(act: HTMLElement, signal: AbortSignal): void {
  const pan = act.querySelector<HTMLElement>("[data-pan]");
  const frame = act.querySelector<HTMLElement>("[data-pan-frame]");
  const image = act.querySelector<HTMLElement>("[data-pan-img]");
  if (!pan || !frame || !image) return;
  gsap.fromTo(
    frame,
    { rotateX: 26, scale: 0.8, y: 70, opacity: 0.15 },
    { rotateX: 0, scale: 1, y: 0, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: pan, start: "top 85%", end: "top 5%", scrub: true } },
  );
  const timeline = gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: pan, pin: true, start: "top top", end: "+=120%", scrub: true, invalidateOnRefresh: true },
    })
    .fromTo(image, { y: 0 }, { y: () => -Math.max(0, image.offsetHeight - frame.clientHeight), duration: 1, ease: "power1.inOut" }, 0);
  const sheen = frame.querySelector("[data-sheen]");
  if (sheen) {
    timeline
      .fromTo(sheen, { xPercent: -120 }, { xPercent: 360, duration: 0.3 }, 0.05)
      .fromTo(sheen, { xPercent: -120 }, { xPercent: 360, duration: 0.3, immediateRender: false }, 0.6);
  }
  tiltOnPointer(pan, frame, 3, signal);
  const beats = all("[data-beat]", pan);
  const span = 1 / beats.length;
  beats.forEach((beat, i) => {
    timeline.fromTo(beat, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.05 }, span * i);
    if (i < beats.length - 1) timeline.to(beat, { opacity: 0, y: -12, duration: 0.05 }, span * (i + 1) - 0.05);
  });
}

function reelScene(act: HTMLElement): void {
  const reel = act.querySelector<HTMLElement>("[data-reel]");
  const track = act.querySelector<HTMLElement>("[data-track]");
  if (!reel || !track) return;
  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const skew = gsap.quickTo(track, "skewX", { duration: 0.35, ease: "power3.out" });
  const clampSkew = gsap.utils.clamp(-3.5, 3.5);
  const settle = gsap.delayedCall(0.12, () => skew(0)).pause();
  const slide = gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: reel,
      pin: true,
      start: "top top",
      end: () => `+=${distance() * 0.6}`,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        skew(clampSkew(self.getVelocity() / -500));
        settle.restart(true);
      },
    },
  });
  all("[data-frame]", track).forEach((frame) => {
    gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: frame, containerAnimation: slide, start: "left right", end: "right left", scrub: true },
      })
      .fromTo(frame, { rotateY: -24, scale: 0.88, opacity: 0.3, transformPerspective: 1600 }, { rotateY: 0, scale: 1, opacity: 1, duration: 0.42 })
      .to(frame, { rotateY: 18, scale: 0.9, opacity: 0.3, duration: 0.38 }, 0.62);
  });
}

function creditsScene(toggleBars: (self: ScrollTrigger) => void): void {
  const section = document.querySelector<HTMLElement>("[data-credits]");
  const roll = section?.querySelector<HTMLElement>("[data-roll]");
  if (!section || !roll) return;
  gsap.fromTo(
    roll,
    { y: () => window.innerHeight * 0.55 },
    {
      y: () => window.innerHeight - roll.offsetHeight,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        pin: true,
        start: "top top",
        end: () => `+=${roll.offsetHeight - window.innerHeight * 0.45}`,
        scrub: true,
        invalidateOnRefresh: true,
        onToggle: toggleBars,
      },
    },
  );
}

function hud(): void {
  const scene = document.querySelector<HTMLElement>("[data-hud-scene]");
  const time = document.querySelector<HTMLElement>("[data-hud-time]");
  if (!scene || !time) return;
  const pad = (value: number) => String(Math.floor(value)).padStart(2, "0");
  const progress = document.querySelector<HTMLElement>("[data-progress]");
  const setProgress = progress ? gsap.quickSetter(progress, "scaleX") : null;
  let lastPaint = 0;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      setProgress?.(self.progress);
      const now = performance.now();
      if (now - lastPaint < 100) return;
      lastPaint = now;
      const seconds = self.progress * RUNTIME_SECONDS;
      time.textContent = `${pad(seconds / 3600)}:${pad((seconds / 60) % 60)}:${pad(seconds % 60)}:${pad((seconds % 1) * 24)}`;
    },
  });
  all("[data-scene]").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) scene.textContent = section.dataset.scene ?? "";
      },
    });
  });
}

function desktopFilm(): () => void {
  const root = document.documentElement;
  root.classList.add("film-on");
  const focusable = all("[data-reel], [data-pan-frame]");
  focusable.forEach((el) => el.removeAttribute("tabindex"));

  const pointer = new AbortController();
  const lenis = new Lenis({ anchors: true, lerp: 0.16 });
  const tick = (time: number) => lenis.raf(time * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const toggleBars = letterbox();
  const stopWord = cycleWord();
  heroScene(toggleBars, pointer.signal);
  trailerScene(toggleBars);
  all("[data-act]").forEach((act) => {
    cardScene(act, toggleBars);
    panScene(act, pointer.signal);
    reelScene(act);
  });
  creditsScene(toggleBars);
  hud();
  gateFlash();
  preloadActs();
  ScrollTrigger.refresh();

  const target = document.getElementById(location.hash.slice(1));
  if (target) lenis.scrollTo(target, { immediate: true, force: true });

  return () => {
    pointer.abort();
    stopWord();
    gsap.ticker.remove(tick);
    lenis.destroy();
    focusable.forEach((el) => el.setAttribute("tabindex", "0"));
    root.classList.remove("film-on");
  };
}

function compactFilm(): () => void {
  const root = document.documentElement;
  root.classList.add("film-lite");
  const frames = all("[data-pan-frame]");
  frames.forEach((el) => el.removeAttribute("tabindex"));
  const stopWord = cycleWord();

  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (hero) {
    driftWall(hero);
    gsap.to("[data-wall]", { opacity: 0.08, scale: 1.5, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  }
  all("[data-line]").forEach((line) => {
    gsap.fromTo(
      line,
      { opacity: 0.1, filter: "blur(8px)" },
      { opacity: 1, filter: "blur(0px)", ease: "none", scrollTrigger: { trigger: line, start: "top 90%", end: "top 58%", scrub: true } },
    );
  });
  all("[data-card]").forEach((card) => {
    gsap.fromTo(
      card.querySelector("[data-card-title]"),
      { scale: 1.3, opacity: 0, filter: "blur(14px)" },
      { scale: 1, opacity: 1, filter: "blur(0px)", ease: "none", scrollTrigger: { trigger: card, start: "top 85%", end: "top 30%", scrub: true } },
    );
  });
  frames.forEach((frame) => {
    const image = frame.querySelector<HTMLElement>("[data-pan-img]");
    if (!image) return;
    gsap.fromTo(
      image,
      { y: 0 },
      {
        y: () => -Math.max(0, image.offsetHeight - frame.clientHeight),
        ease: "none",
        scrollTrigger: { trigger: frame, start: "top 70%", end: "bottom 30%", scrub: true, invalidateOnRefresh: true },
      },
    );
  });
  ScrollTrigger.refresh();

  return () => {
    stopWord();
    frames.forEach((el) => el.setAttribute("tabindex", "0"));
    root.classList.remove("film-lite");
  };
}

export function initFilm(): void {
  const media = gsap.matchMedia();
  media.add(DESKTOP, desktopFilm);
  media.add(COMPACT, compactFilm);
}
