# Questory — GitHub Pages

Site for [Questory](https://github.com/Questory-Labs/Questory): Steam-first library and media intelligence.

Built with Astro + Tailwind CSS v4. Visual language matches the main app (`apps/web`).

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321). The self-hosting guide lives at [/self-hosting/](/self-hosting/).

## Build

```bash
pnpm build
pnpm preview
```

Static output goes to `dist/`.

## Adding screenshots

1. Drop original WebP captures in `assets/screenshots/{id}.webp` (keep full resolution; originals are never modified).
2. Add metadata for the shot in `src/data/features.ts` (`screenshotGroups` and optionally `featuredScreenshotIds`).
3. Generate web variants:

```bash
pnpm screenshots
```

This writes optimized card (800px) and full (1440px) images to `public/screenshots/card/` and `public/screenshots/full/`. `pnpm build` runs the resize step automatically via `prebuild`.

After cloning the repo, run `pnpm screenshots` once before `pnpm dev` so local previews include generated images.

## Deployment

Pushes to `main` run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) and publish to GitHub Pages.

**Org site:** GitHub serves organization pages from a repo named `<org>.github.io` (e.g. `Questory-Labs.github.io`). Rename this repo or configure a custom domain in Pages settings before going live.

After the first push, enable **Settings → Pages → Source: GitHub Actions**.

## License

Site content references Questory, which is source-available under PolyForm Noncommercial 1.0.0. See the [main repository LICENSE](https://github.com/Questory-Labs/Questory/blob/main/LICENSE).
