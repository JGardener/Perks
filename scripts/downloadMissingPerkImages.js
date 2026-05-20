/**
 * Downloads perk images missing from public/perks/ using the DBD Fandom wiki.
 * Run from project root: node scripts/downloadMissingPerkImages.js
 */

import fs from "fs";
import path from "path";

const WIKI_API = "https://deadbydaylight.fandom.com/api.php";
const OUTPUT_DIR = "public/perks";
const DELAY_MS = 300;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Convert our local filename to the expected wiki image name.
// Handles all prefix variants seen in the API data:
//   T_UI_iconsPerks_*  →  IconPerks_*
//   T_UI_iconPerks_*   →  IconPerks_*
//   T_iconPerks_*      →  IconPerks_*
//   iconsPerks_*       →  IconPerks_*
//   iconPerks_*        →  IconPerks_*
function toWikiName(localFilename) {
  let name = localFilename.replace(/\.png$/, "");
  name = name.replace(/^T_UI_/, "").replace(/^T_/, "");
  name = name.replace(/^UI_iconsPerks_/, "iconPerks_").replace(/^UI_iconPerks_/, "iconPerks_");
  name = name.replace(/^iconsPerks_/, "iconPerks_");
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return name + ".png";
}

// Fetch all IconPerks_*.png entries from the wiki, paginating until done.
// Returns a map of  name (e.g. "IconPerks_Deadlock.png") → CDN url.
async function fetchWikiIconCatalogue() {
  const catalogue = {};
  let aicontinue = null;
  let page = 0;

  do {
    const params = new URLSearchParams({
      action: "query",
      list: "allimages",
      aiprefix: "IconPerks",
      ailimit: "500",
      format: "json",
    });
    if (aicontinue) params.set("aicontinue", aicontinue);

    const res = await fetch(`${WIKI_API}?${params}`, {
      headers: { "User-Agent": "DBDPerkRater/1.0" },
    });
    const data = await res.json();

    for (const img of data.query.allimages) {
      catalogue[img.name] = img.url;
    }

    page++;
    process.stdout.write(`  Fetched wiki catalogue page ${page} (${Object.keys(catalogue).length} icons so far)\r`);
    aicontinue = data.continue?.aicontinue ?? null;
    if (aicontinue) await sleep(DELAY_MS);
  } while (aicontinue);

  console.log(`\n  Wiki catalogue: ${Object.keys(catalogue).length} icons total`);
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

  console.log(`Missing: ${missing.length} images`);

  // ── 2. Fetch full wiki icon catalogue ────────────────────────────────────
  console.log("Fetching wiki icon catalogue…");
  const catalogue = await fetchWikiIconCatalogue();

  // ── 3. Download matched images ───────────────────────────────────────────
  let downloaded = 0;
  const noMatch = [];

  for (const localFile of missing) {
    const wikiName = toWikiName(localFile);
    const cdnUrl = catalogue[wikiName];

    if (!cdnUrl) {
      noMatch.push({ localFile, wikiName });
      continue;
    }

    const imgRes = await fetch(cdnUrl, {
      headers: { "User-Agent": "DBDPerkRater/1.0" },
    });
    if (!imgRes.ok) {
      console.log(`  Download failed (${imgRes.status}): ${localFile}`);
      noMatch.push({ localFile, wikiName });
      continue;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(path.join(OUTPUT_DIR, localFile), buffer);
    downloaded++;
    process.stdout.write(`  Downloaded: ${downloaded} / ${missing.length - noMatch.length}\r`);
    await sleep(DELAY_MS);
  }

  // ── 4. Report ────────────────────────────────────────────────────────────
  console.log(`\n✓ Downloaded: ${downloaded}`);

  if (noMatch.length > 0) {
    console.log(`\n✗ No wiki match for ${noMatch.length} files:`);
    for (const { localFile, wikiName } of noMatch) {
      console.log(`  ${localFile}  (tried: ${wikiName})`);
    }
  }
}

main().catch(console.error);
