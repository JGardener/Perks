import fs from "fs";
import path from "path";

async function main() {
  const response = await fetch(`https://dbd.tricky.lol/api/perks`);
  const data = await response.json();
  fs.mkdirSync("public/perks", { recursive: true });

  const perks = Object.values(data);
  for (const perk of perks) {
    const imagePath = perk.image;
    const filename = imagePath.split("/").pop();
    const repoFilename = filename.replace(
      /(iconPerks_)([a-z])/,
      (_, prefix, char) => prefix + char.toUpperCase(),
    );
    const downloadURL = `https://raw.githubusercontent.com/newbstar/dbd-assets/main/icons/${repoFilename}.png`;
    const imageResponse = await fetch(downloadURL);
    if (imageResponse.status !== 200) {
      console.log(`Skipped: ${filename} (${imageResponse.status})`);
      continue;
    }
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    fs.writeFileSync(path.join("public", "perks", filename + ".png"), buffer);
  }
}

main();
