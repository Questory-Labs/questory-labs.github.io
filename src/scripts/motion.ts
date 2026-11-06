export const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export const reducedMotion = (): boolean =>
  typeof window.matchMedia === "function" && window.matchMedia(REDUCED_QUERY).matches;

export const MODULE_TINTS = ["143,214,196", "240,168,184", "230,194,122", "174,185,242"] as const;

export function initReveal(): void {
  const items = document.querySelectorAll<HTMLElement>(".q-reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  items.forEach((el) => io.observe(el));
}

export function initCopy(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const scope = button.closest("[data-copy-scope]");
      if (!scope) return;
      const text = Array.from(scope.querySelectorAll(".q-copy-text"))
        .map((el) => el.textContent?.trim() ?? "")
        .filter(Boolean)
        .join("\n");
      const label = button.querySelector(".q-copy-label") ?? button;
      const idle = button.dataset.copyIdle ?? "Copy";
      try {
        await navigator.clipboard.writeText(text);
        label.textContent = "Copied";
      } catch {
        label.textContent = "Press Ctrl+C";
      }
      window.setTimeout(() => {
        label.textContent = idle;
      }, 1600);
    });
  });
}

function plus(ctx: CanvasRenderingContext2D, x: number, y: number, arm: number): void {
  ctx.fillRect(x - arm, y - 0.6, arm * 2, 1.2);
  ctx.fillRect(x - 0.6, y - arm, 1.2, arm * 2);
}

export function paintFingerprint(canvas: HTMLCanvasElement, time: number): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const step = 8;
  ctx.clearRect(0, 0, W, H);
  const blobs: [number, number, string][] = [
    [0.38, 0.4, MODULE_TINTS[0]],
    [0.66, 0.36, MODULE_TINTS[1]],
    [0.6, 0.7, MODULE_TINTS[2]],
    [0.32, 0.7, MODULE_TINTS[3]],
  ];
  const spread = 2 * (W * 0.13) ** 2;
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      let best = 0;
      let col = "236,236,238";
      blobs.forEach(([bxr, byr, tint], k) => {
        const bx = (bxr + Math.sin(time * 0.35 + k * 1.7) * 0.07) * W;
        const by = (byr + Math.cos(time * 0.3 + k) * 0.07) * H;
        const v = Math.exp(-((x - bx) ** 2 + (y - by) ** 2) / spread);
        if (v > best) {
          best = v;
          col = tint;
        }
      });
      const a = Math.min(1, best * 1.2) * (0.75 + 0.25 * Math.sin(time * 2.2 + x * 0.3 + y * 0.17));
      if (a < 0.06) continue;
      ctx.fillStyle = `rgba(${best > 0.6 ? col : "236,236,238"},${a.toFixed(2)})`;
      plus(ctx, x, y, 0.8 + a * 2.2);
    }
  }
}

export function animateWhileVisible(canvas: HTMLCanvasElement, paint: (time: number) => void, still = 0): void {
  if (reducedMotion() || !("IntersectionObserver" in window)) {
    paint(still);
    return;
  }
  let raf = 0;
  let visible = false;
  const t0 = performance.now();
  const loop = (ts: number) => {
    paint((ts - t0) / 1000);
    if (visible) raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) raf = requestAnimationFrame(loop);
  }).observe(canvas);
  paint(still);
}

export { plus as paintPlus };

export function initToc(nav: HTMLElement): void {
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  const ind = nav.querySelector<HTMLElement>(".q-toc-ind");
  const targets = links
    .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
    .filter((el): el is HTMLElement => el !== null);
  if (!targets.length || !("IntersectionObserver" in window)) return;
  const setActive = (id: string) => {
    links.forEach((link) => {
      const on = decodeURIComponent(link.hash.slice(1)) === id;
      if (on) {
        link.setAttribute("aria-current", "location");
        if (ind) {
          ind.style.transform = `translateY(${link.offsetTop}px)`;
          ind.style.height = `${link.offsetHeight}px`;
        }
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };
  const io = new IntersectionObserver(
    (entries) => {
      const hit = entries.find((entry) => entry.isIntersecting);
      if (hit) setActive(hit.target.id);
    },
    { rootMargin: "0px 0px -75% 0px", threshold: 0 },
  );
  targets.forEach((el) => io.observe(el));
  setActive(targets[0].id);
}
