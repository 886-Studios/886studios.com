import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicAssets = path.resolve("public/assets");

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
];

const singleImages = [
  {
    source: "hero/sf-tpe-hero.jpg",
    output: "hero/sf-tpe-hero-1280.webp",
    width: 1280,
    quality: 78,
  },
  {
    source: "ikigai-insights-substack-wide.jpg",
    output: "ikigai-insights-substack-wide-640.webp",
    width: 640,
    quality: 82,
  },
  {
    source: "ikigai-insights-substack-wide.jpg",
    output: "ikigai-insights-substack-wide-1280.webp",
    width: 1280,
    quality: 82,
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

const toWebp = async (sourcePath, outputPath, width, quality) => {
  await sharp(sourcePath)
    .rotate()
    .resize({
      width,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({
      quality,
      alphaQuality: 90,
      effort: 5,
      smartSubsample: true,
    })
    .toFile(outputPath);
};

const outputFiles = [];
const sourceFiles = new Set();

for (const group of imageGroups) {
  const directoryPath = path.join(publicAssets, group.directory);
  const filenames = (await readdir(directoryPath))
    .filter((filename) => group.pattern.test(filename))
    .sort();

  for (const filename of filenames) {
    const extension = path.extname(filename);
    const basename = path.basename(filename, extension);
    const sourcePath = path.join(directoryPath, filename);
    sourceFiles.add(sourcePath);

    for (const width of group.widths) {
      const outputPath = path.join(directoryPath, `${basename}-${width}.webp`);
      await toWebp(sourcePath, outputPath, width, group.quality);
      outputFiles.push(outputPath);
    }
  }
}

for (const image of singleImages) {
  const sourcePath = path.join(publicAssets, image.source);
  const outputPath = path.join(publicAssets, image.output);
  sourceFiles.add(sourcePath);
  await toWebp(sourcePath, outputPath, image.width, image.quality);
  outputFiles.push(outputPath);
}

const logosDirectory = path.join(publicAssets, "logos");
const logoFilenames = (await readdir(logosDirectory))
  .filter((filename) => /\.png$/i.test(filename) && filename !== "cold-electric-og.png")
  .sort();

for (const filename of logoFilenames) {
  const sourcePath = path.join(logosDirectory, filename);
  const outputPath = path.join(logosDirectory, `${path.basename(filename, ".png")}.webp`);
  sourceFiles.add(sourcePath);
  await toWebp(sourcePath, outputPath, 512, 86);
  outputFiles.push(outputPath);
}

const testimonialsDirectory = path.join(publicAssets, "programs/testimonials");
const testimonialFilenames = (await readdir(testimonialsDirectory))
  .filter((filename) => /\.(?:jpe?g|png)$/i.test(filename))
  .sort();

for (const filename of testimonialFilenames) {
  const sourcePath = path.join(testimonialsDirectory, filename);
  const outputPath = path.join(
    testimonialsDirectory,
    `${path.basename(filename, path.extname(filename))}.webp`,
  );
  sourceFiles.add(sourcePath);
  await toWebp(sourcePath, outputPath, 720, 80);
  outputFiles.push(outputPath);
}

const sumBytes = async (files) => {
  const sizes = await Promise.all([...files].map(async (file) => (await stat(file)).size));
  return sizes.reduce((total, size) => total + size, 0);
};

const sourceBytes = await sumBytes(sourceFiles);
const outputBytes = await sumBytes(outputFiles);
const savedPercent = Math.round((1 - outputBytes / sourceBytes) * 100);

console.log(
  `[images] Generated ${outputFiles.length} WebP files: ` +
    `${(sourceBytes / 1024 / 1024).toFixed(2)} MB → ${(outputBytes / 1024 / 1024).toFixed(2)} MB ` +
    `(${savedPercent}% smaller).`,
);
