/**
 * Downloads missing perk images from DanteASC4/dbd-assets on GitHub.
 * Uses the GitHub Contents API to crawl all chapter subfolders and build a
 * flat filename → download_url map, then fills in any gaps in public/perks/.
 *
 * Run from project root: node scripts/downloadFromDanteRepo.js
 */

import fs from "fs";
import path from "path";

const REPO_API = "https://api.github.com/repos/DanteASC4/dbd-assets/contents/Perks";
const OUTPUT_DIR = "public/perks";
const DELAY_MS = 100;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HEADERS = {
  "User-Agent": "DBDPerkRater/1.0",
  Accept: "application/vnd.github.v3+json",
};

// Recursively collect all PNG download_urls from a GitHub contents listing.
async function collectPngUrls(apiUrl, catalogue = {}) {
  const res = await fetch(apiUrl, { headers: HEADERS });

  if (!res.ok) {
    console.warn(`  GitHub API error ${res.status} for ${apiUrl}`);
    return catalogue;
  }

  const entries = await res.json();

  for (const entry of entries) {
    if (entry.type === "dir") {
      await sleep(DELAY_MS);
      await collectPngUrls(entry.url, catalogue);
    } else if (entry.type === "file" && entry.name.endsWith(".png")) {
      catalogue[entry.name] = entry.download_url;
    }
  }

  return catalogue;
}

async function main() {
  // ── 1. Find missing images ───────────────────────────────────────────────
  console.log("Fetching perk list from dbd.tricky.lol…");
  const apiRes = await fetch("https://dbd.tricky.lol/api/perks");
  const perksData = await apiRes.json();
  const allPerks = Object.values(perksData);

  const existing = new Set(fs.readdirSync(OUTPUT_DIR));
  const missing = allPerks
    .map((p) => p.image.split("/").pop() + ".png")
    .filter((f) => !existing.has(f));

  if (missing.length === 0) {
    console.log("Nothing missing — all perk images are present.");
    return;
  }

  console.log(`Missing: ${missing.length} images`);

  // ── 2. Crawl the repo to build filename → download_url catalogue ─────────
  console.log("Crawling DanteASC4/dbd-assets…");
  const catalogue = await collectPngUrls(REPO_API);
  console.log(`  Repo catalogue: ${Object.keys(catalogue).length} PNG files found`);

  // Build a lowercase → original-name map for case-insensitive fallback
  const catalogueLower = {};
  for (const name of Object.keys(catalogue)) {
    catalogueLower[name.toLowerCase()] = name;
  }

  // ── 3. Download matched images ───────────────────────────────────────────
  let downloaded = 0;
  const noMatch = [];

  for (const localFile of missing) {
    // Try exact match first, then case-insensitive fallback
    const repoName = catalogue[localFile]
      ? localFile
      : catalogueLower[localFile.toLowerCase()];
    const downloadUrl = repoName ? catalogue[repoName] : null;

    if (!downloadUrl) {
      noMatch.push(localFile);
      continue;
    }

    const imgRes = await fetch(downloadUrl, { headers: HEADERS });
    if (!imgRes.ok) {
      console.log(`  Download failed (${imgRes.status}): ${localFile}`);
      noMatch.push(localFile);
      continue;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(path.join(OUTPUT_DIR, localFile), buffer);
    downloaded++;
    process.stdout.write(`  Downloaded: ${downloaded}\r`);
    await sleep(DELAY_MS);
  }

  // ── 4. Report ────────────────────────────────────────────────────────────
  console.log(`\n✓ Downloaded: ${downloaded}`);

  if (noMatch.length > 0) {
    console.log(`\n✗ Not found in repo: ${noMatch.length} files:`);
    noMatch.forEach((f) => console.log(`  ${f}`));
    console.log(
      "\nThese are likely the most recent perks not yet in any community asset repo.",
    );
  }
}

main().catch(console.error);
