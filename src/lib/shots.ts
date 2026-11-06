import path from "node:path";
import sharp from "sharp";

const VARIANT_WIDTHS = { card: 800, full: 1440, cine: 2200 } as const;
export type Variant = keyof typeof VARIANT_WIDTHS;

export type ShotImage = { src: string; width: number; height: number };

const sources = new Map<string, Promise<{ width: number; height: number }>>();

function sourceSize(id: string) {
  const known = sources.get(id);
  if (known) return known;
  const file = path.join(process.cwd(), "assets", "screenshots", `${id}.webp`);
  const size = sharp(file)
    .metadata()
    .then(({ width, height }) => {
      if (!width || !height) throw new Error(`Unreadable screenshot: ${file}`);
      return { width, height };
    });
  sources.set(id, size);
  return size;
}

export async function shotImage(id: string, variant: Variant): Promise<ShotImage> {
  const { width, height } = await sourceSize(id);
  const outWidth = Math.min(VARIANT_WIDTHS[variant], width);
  return {
    src: `/screenshots/${variant}/${id}.webp`,
    width: outWidth,
    height: Math.round((height * outWidth) / width),
  };
}
