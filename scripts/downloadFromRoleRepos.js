/**
 * Downloads remaining missing perk images from role-specific GitHub repos,
 * using raw.githubusercontent.com (no API rate limits).
 *
 * Sources:
 *   Survivor: Naethii/survivorperks (updated Oct 2025, flat root, PascalCase)
 *   Killer:   DanteASC4/dbd-assets-simple (updated Apr 2025, icons/, PascalCase)
 *
 * Run from project root: node scripts/downloadFromRoleRepos.js
 */

import fs from "fs";
import path from "path";

const SURVIVOR_BASE =
  "https://raw.githubusercontent.com/Naethii/survivorperks/main";
const KILLER_BASE =
  "https://raw.githubusercontent.com/DanteASC4/dbd-assets-simple/main/icons";
const OUTPUT_DIR = "public/perks";
const DELAY_MS = 150;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Strip all known asset prefixes and return PascalCase perk name.
// iconPerks_floodOfRage     → FloodOfRage
// T_UI_iconPerks_AllShaking → AllShaking
// iconsPerks_ChampionOfLight → ChampionOfLight
function toPascalCase(localFilename) {
  let name = localFilename.replace(/\.png$/, "");
  name = name
    .replace(/^T_UI_iconsPerks_/, "")
    .replace(/^T_UI_iconPerks_/, "")
    .replace(/^T_iconsPerks_/, "")
    .replace(/^T_iconPerks_/, "")
    .replace(/^iconsPerks_/, "")
    .replace(/^iconPerks_/, "");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function tryDownload(url) {
  const res = await fetch(url, { headers: { "User-Agent": "DBDPerkRater/1.0" } });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  // ── 1. Fetch perk list with role info ────────────────────────────────────
  console.log("Fetching perk list from dbd.tricky.lol…");
  const apiRes = await fetch("https://dbd.tricky.lol/api/perks");
  const perksData = await apiRes.json();
  const allPerks = Object.values(perksData);

  // Build filename → role map
  const roleMap = {};
  for (const perk of allPerks) {
    roleMap[perk.image.split("/").pop() + ".png"] = perk.role;
  }

  const existing = new Set(fs.readdirSync(OUTPUT_DIR));
  const missing = Object.keys(roleMap).filter((f) => !existing.has(f));

  if (missing.length === 0) {
    console.log("Nothing missing — all perk images are present.");
    return;
  }

  console.log(`Missing: ${missing.length} images`);

  // ── 2. Attempt download from role-specific repos ─────────────────────────
  let downloaded = 0;
  const noMatch = [];

  for (const localFile of missing) {
    const role = roleMap[localFile];
    const pascal = toPascalCase(localFile);
    const url =
      role === "survivor"
        ? `${SURVIVOR_BASE}/${pascal}.png`
        : `${KILLER_BASE}/${pascal}.png`;

    const buffer = await tryDownload(url);

    if (!buffer) {
      noMatch.push({ localFile, tried: url });
      continue;
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, localFile), buffer);
    downloaded++;
    process.stdout.write(`  Downloaded: ${downloaded}\r`);
    await sleep(DELAY_MS);
  }

  // ── 3. Report ────────────────────────────────────────────────────────────
  console.log(`\n✓ Downloaded: ${downloaded}`);

  if (noMatch.length > 0) {
    console.log(`\n✗ Not found: ${noMatch.length} files:`);
    noMatch.forEach(({ localFile, tried }) =>
      console.log(`  ${localFile}  (tried: ${tried})`),
    );
  }
}

main().catch(console.error);
