import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const inputDir = path.join(root, "assets", "screenshots");
const outputRoot = path.join(root, "public", "screenshots");

const VARIANTS = [
  { name: "card", maxWidth: 800, quality: 82 },
  { name: "full", maxWidth: 1440, quality: 85 },
];

async function isUpToDate(sourcePath, outputPath) {
  try {
    const [sourceStat, outputStat] = await Promise.all([
      fs.stat(sourcePath),
      fs.stat(outputPath),
    ]);
    return outputStat.mtimeMs >= sourceStat.mtimeMs;
  } catch {
    return false;
  }
}

async function resizeVariant(sourcePath, outputPath, { maxWidth, quality }) {
  await sharp(sourcePath)
    .resize({ width: maxWidth, fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);
}

async function main() {
  let entries;
  try {
    entries = await fs.readdir(inputDir);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(`No input directory at ${inputDir}; skipping.`);
      return;
    }
    throw error;
  }

  const sources = entries.filter((name) => name.endsWith(".webp"));
  if (sources.length === 0) {
    console.warn(`No .webp files found in ${inputDir}; skipping.`);
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const variant of VARIANTS) {
    const outputDir = path.join(outputRoot, variant.name);
    await fs.mkdir(outputDir, { recursive: true });

    for (const filename of sources) {
      const sourcePath = path.join(inputDir, filename);
      const outputPath = path.join(outputDir, filename);

      if (await isUpToDate(sourcePath, outputPath)) {
        skipped++;
        continue;
      }

      await resizeVariant(sourcePath, outputPath, variant);
      created++;
      console.log(`wrote ${path.relative(root, outputPath)}`);
    }
  }

  console.log(
    `screenshots: ${created} generated, ${skipped} up to date (${sources.length} source files)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
