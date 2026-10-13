import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const projectRoot = process.cwd();
const outputPath = path.join(projectRoot, "src/data/contentDates.generated.ts");
const currentDate = new Date().toISOString().slice(0, 10);
const sourceCache = new Map();
const sourceFileCache = new Map();
const blameCache = new Map();

const toIsoDate = (epochSeconds) =>
  new Date(Number(epochSeconds) * 1000).toISOString().slice(0, 10);

const maxDate = (...dates) =>
  dates.flat().filter(Boolean).sort((left, right) => right.localeCompare(left))[0];

async function getSource(relativePath) {
  if (!sourceCache.has(relativePath)) {
    sourceCache.set(relativePath, await readFile(path.join(projectRoot, relativePath), "utf8"));
  }
  return sourceCache.get(relativePath);
}

async function getSourceFile(relativePath) {
  if (!sourceFileCache.has(relativePath)) {
    const source = await getSource(relativePath);
    sourceFileCache.set(
      relativePath,
      ts.createSourceFile(relativePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS),
    );
  }
  return sourceFileCache.get(relativePath);
}

function getBlameDates(relativePath) {
  if (blameCache.has(relativePath)) return blameCache.get(relativePath);

  const output = execFileSync("git", ["blame", "--line-porcelain", "--", relativePath], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const lineDates = new Map();
  let finalLine;
  let commitTime;

  for (const line of output.split("\n")) {
    const header = line.match(/^[0-9a-f^]{40}\s+\d+\s+(\d+)(?:\s+\d+)?$/i);
    if (header) {
      finalLine = Number(header[1]);
      commitTime = undefined;
      continue;
    }
    if (line.startsWith("committer-time ")) {
      commitTime = toIsoDate(line.slice("committer-time ".length));
      continue;
    }
    if (line.startsWith("\t") && finalLine) {
      lineDates.set(finalLine, commitTime ?? currentDate);
    }
  }

  if (lineDates.size === 0) {
    throw new Error(`Could not derive Git blame dates for ${relativePath}`);
  }

  blameCache.set(relativePath, lineDates);
  return lineDates;
}

function getNodeDate(relativePath, sourceFile, node) {
  const startLine = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
  const lineDates = getBlameDates(relativePath);
  const dates = [];

  for (let line = startLine; line <= endLine; line += 1) {
    dates.push(lineDates.get(line));
  }

  const date = maxDate(dates);
  if (!date) throw new Error(`Could not derive a content date for ${relativePath}:${startLine}`);
  return date;
}

function getFileDate(relativePath) {
  return maxDate([...getBlameDates(relativePath).values()]);
}

function unwrapExpression(node) {
  let current = node;
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function getPropertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function getProperty(object, name) {
  const property = object.properties.find(
    (candidate) => ts.isPropertyAssignment(candidate) && getPropertyName(candidate.name) === name,
  );
  return property ? unwrapExpression(property.initializer) : undefined;
}

function getVariableInitializer(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === name &&
        declaration.initializer
      ) {
        return unwrapExpression(declaration.initializer);
      }
    }
  }
  throw new Error(`Could not find ${name} in ${sourceFile.fileName}`);
}

async function getResourceRecordDates() {
  const relativePath = "src/data/resourceArticles.ts";
  const sourceFile = await getSourceFile(relativePath);
  const records = new Map();

  for (const variableName of ["resourceArticles", "standaloneResourceArticles"]) {
    const array = getVariableInitializer(sourceFile, variableName);
    if (!ts.isArrayLiteralExpression(array)) {
      throw new Error(`${variableName} is not an array in ${relativePath}`);
    }

    for (const element of array.elements) {
      const record = unwrapExpression(element);
      if (!ts.isObjectLiteralExpression(record)) continue;
      const slug = getProperty(record, "slug");
      if (!slug || !ts.isStringLiteral(slug)) continue;
      records.set(slug.text, getNodeDate(relativePath, sourceFile, record));
    }
  }

  return records;
}

async function getSiteContentDate(...propertyPath) {
  const relativePath = "src/data/siteContent.ts";
  const sourceFile = await getSourceFile(relativePath);
  let current = getVariableInitializer(sourceFile, "siteContent");

  for (const propertyName of propertyPath) {
    if (!ts.isObjectLiteralExpression(current)) {
      throw new Error(`${propertyPath.join(".")} is not an object in ${relativePath}`);
    }
    current = getProperty(current, propertyName);
    if (!current) throw new Error(`Could not find ${propertyPath.join(".")} in ${relativePath}`);
  }

  return getNodeDate(relativePath, sourceFile, current);
}

async function generateContentDates() {
  const resourceRecordDates = await getResourceRecordDates();
  const resourceTemplateDate = getFileDate("src/components/pages/ResourceArticlePage.astro");
  const contentDates = {
    "/": maxDate(
      await getSiteContentDate("home"),
      getFileDate("src/components/pages/HomePage.astro"),
    ),
    "/ikigai-launchpad": maxDate(
      await getSiteContentDate("programs", "launchpad"),
      getFileDate("src/components/pages/ProgramsPage.astro"),
    ),
    "/launch-station": maxDate(
      await getSiteContentDate("programs", "launchStation"),
      getFileDate("src/components/pages/LaunchStationPage.astro"),
    ),
    "/resources": maxDate(
      await getSiteContentDate("resources"),
      getFileDate("src/components/pages/ResourcesPage.astro"),
    ),
  };

  for (const [slug, date] of resourceRecordDates) {
    const pathPrefix = ["incorporation-101", "interview-guidebook"].includes(slug)
      ? ""
      : "/resources";
    contentDates[`${pathPrefix}/${slug}`] = maxDate(date, resourceTemplateDate);
  }

  return Object.fromEntries(
    Object.entries(contentDates).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function serialize(contentDates) {
  return `// Generated by scripts/generate-content-dates.mjs. Do not edit manually.\nexport const contentDates: Readonly<Record<string, string>> = ${JSON.stringify(contentDates, null, 2)};\n`;
}

try {
  const contentDates = await generateContentDates();
  const output = serialize(contentDates);
  let existing = "";
  try {
    existing = await readFile(outputPath, "utf8");
  } catch {
    // The first run creates the generated fallback used when Git metadata is unavailable.
  }

  if (existing !== output) await writeFile(outputPath, output);
  console.log(`[content-dates] Generated ${Object.keys(contentDates).length} source-backed dates.`);
} catch (error) {
  try {
    await readFile(outputPath, "utf8");
    console.warn(
      `[content-dates] Git metadata unavailable; keeping the committed fallback. ${error.message}`,
    );
  } catch {
    throw error;
  }
}
