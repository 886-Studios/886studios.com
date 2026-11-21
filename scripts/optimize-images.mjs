import { createHash, randomUUID } from "node:crypto";
import { readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicAssets = path.resolve("public/assets");
const manifestPath = path.resolve("scripts/data/image-variants.json");
const force = process.argv.includes("--force");

async function readIfPresent(file) {
  try {
    return await readFile(file);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function replaceFile(file, contents) {
  const temporaryPath = `${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, contents);
    await rename(temporaryPath, file);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

const existingManifest = await readIfPresent(manifestPath);
const previousVariants = existingManifest ? JSON.parse(existingManifest.toString()) : {};
const variants = {};
const sourceSizes = new Map();
let outputBytes = 0;
let generated = 0;

const imageGroups = [
  {
    directory: "launch-station",
    pattern: /\.(?:jpe?g|png)$/i,
    widths: [480, 960, 1440],
    quality: 82,
  },
  {
    directory: "landing",
    pattern: /\.(?:jpe?g|png)$/i,
    widths: [480, 960],
    quality: 78,
  },
  {
    directory: "resources/news",
    pattern: /\.(?:jpe?g|png)$/i,
    widths: [480, 960],
    quality: 78,
  },
  {
    directory: "logos",
    pattern: /^(?!cold-electric-og\.png$).*\.png$/i,
    widths: [512],
    quality: 86,
    omitWidthSuffix: true,
  },
  {
    directory: "programs/testimonials",
    pattern: /\.(?:jpe?g|png)$/i,
    widths: [720],
    quality: 80,
    omitWidthSuffix: true,
  },
];

const singleImages = [
  {
    source: "hero/sf-tpe-hero.jpg",
    output: "hero/sf-tpe-hero-1280.webp",
    width: 1280,
    quality: 78,
  },
  {
    source: "programs/launch-station-community-collage-2026.jpg",
    output: "programs/launch-station-community-collage-480.webp",
    width: 480,
    quality: 80,
  },
  {
    source: "programs/launch-station-community-collage-2026.jpg",
    output: "programs/launch-station-community-collage-800.webp",
    width: 800,
    quality: 80,
  },
  {
    source: "portfolio/kardomo.png",
    output: "portfolio/kardomo.webp",
    width: 512,
    quality: 84,
  },
  // Directory portraits render at up to 200 CSS px; keep originals for profiles.
  ...["james-hong-portrait", "patryk-chojecki"].map((name) => ({
    source: `headshots/team/${name}.webp`,
    output: `headshots/team/${name}-400.webp`,
    width: 400,
    quality: 84,
  })),
];

async function toWebp(sourcePath, outputPath, width, quality) {
  const key = path.relative(publicAssets, outputPath).split(path.sep).join("/");
  const resize = { width, withoutEnlargement: true, fit: "inside" };
  const webp = { quality, alphaQuality: 90, effort: 5, smartSubsample: true };
  const source = await readFile(sourcePath);
  sourceSizes.set(sourcePath, source.length);
  const existingOutput = await readIfPresent(outputPath);
  const recipe = JSON.stringify({
    rotate: true,
    resize,
    webp,
    sharp: sharp.versions.sharp,
    vips: sharp.versions.vips,
    encoder: sharp.versions.webp,
  });
  // Verify the tracked output as well as the source, so missing or damaged variants are rebuilt.
  const sourceHash = createHash("sha256").update(source).digest();
  const fingerprint = (output) => createHash("sha256").update(recipe).update(sourceHash).update(output).digest("hex");

  if (!force && existingOutput && previousVariants[key] === fingerprint(existingOutput)) {
    variants[key] = previousVariants[key];
    outputBytes += existingOutput.length;
    return;
  }

  const output = await sharp(source)
    .rotate()
    .resize(resize)
    .webp(webp)
    .toBuffer();
  if (!existingOutput?.equals(output)) await replaceFile(outputPath, output);
  variants[key] = fingerprint(output);
  outputBytes += output.length;
  generated += 1;
}

for (const group of imageGroups) {
  const directoryPath = path.join(publicAssets, group.directory);
  const filenames = (await readdir(directoryPath))
    .filter((filename) => group.pattern.test(filename))
    .sort();

  for (const filename of filenames) {
    const extension = path.extname(filename);
    const basename = path.basename(filename, extension);
    const sourcePath = path.join(directoryPath, filename);

    for (const width of group.widths) {
      const suffix = group.omitWidthSuffix ? "" : `-${width}`;
      const outputPath = path.join(directoryPath, `${basename}${suffix}.webp`);
      await toWebp(sourcePath, outputPath, width, group.quality);
    }
  }
}

for (const image of singleImages) {
  const sourcePath = path.join(publicAssets, image.source);
  const outputPath = path.join(publicAssets, image.output);
  await toWebp(sourcePath, outputPath, image.width, image.quality);
}

const manifest = `${JSON.stringify(variants, null, 2)}\n`;
if (existingManifest?.toString() !== manifest) await replaceFile(manifestPath, manifest);

const sourceBytes = [...sourceSizes.values()].reduce((total, size) => total + size, 0);
const savedPercent = Math.round((1 - outputBytes / sourceBytes) * 100);

console.log(
  `[images] Encoded ${generated} WebP files, reused ${Object.keys(variants).length - generated}: ` +
    `${(sourceBytes / 1024 / 1024).toFixed(2)} MB → ${(outputBytes / 1024 / 1024).toFixed(2)} MB ` +
    `(${savedPercent}% smaller).`,
);
