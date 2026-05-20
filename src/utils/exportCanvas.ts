import type { Grade, Perk } from "../types/dbd";
import { GRADE_COLORS, GRADE_ORDER } from "./gradeColors";
import { getPerkImageUrl } from "./perkUtils";

const BG = "#0a0a0a";
const CARD_BG = "#111111";
const EMBER = "#e8973a";
const PARCHMENT_DIM = "#a8957e";
const SLOT_EMPTY_BG = "#1c1c1c";
const SLOT_EMPTY_PLUS = "#6b4318";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = () => resolve(fallback);
      fallback.src = "/perk-placeholder.svg";
    };
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

export async function exportBuildImage(
  slots: (Perk | null)[],
  role: "survivor" | "killer",
): Promise<void> {
  await document.fonts.ready;

  const W = 640;
  const H = 220;
  const ICON = 96;
  const PAD = 24;
  const GAP = (W - PAD * 2 - ICON * 4) / 3;
  const ICON_Y = 52;

  const images = await Promise.all(
    slots.map((p) => (p ? loadImage(getPerkImageUrl(p.image)) : Promise.resolve(null))),
  );

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Role label
  ctx.fillStyle = EMBER;
  ctx.font = `600 11px "Cinzel", serif`;
  ctx.letterSpacing = "2px";
  ctx.fillText(`${role.toUpperCase()} BUILD`, PAD, 32);
  ctx.letterSpacing = "0px";

  slots.forEach((perk, i) => {
    const x = PAD + i * (ICON + GAP);
    const img = images[i];

    if (perk && img) {
      // Clip to rounded rect and draw image
      ctx.save();
      roundRect(ctx, x, ICON_Y, ICON, ICON, 6);
      ctx.clip();
      ctx.drawImage(img, x, ICON_Y, ICON, ICON);
      ctx.restore();
    } else {
      // Empty slot
      ctx.fillStyle = SLOT_EMPTY_BG;
      roundRect(ctx, x, ICON_Y, ICON, ICON, 6);
      ctx.fill();
      ctx.fillStyle = SLOT_EMPTY_PLUS;
      ctx.font = `300 32px "Oswald", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", x + ICON / 2, ICON_Y + ICON / 2);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }

    // Perk name
    const name = perk?.name ?? "";
    if (name) {
      ctx.fillStyle = PARCHMENT_DIM;
      ctx.font = `400 10px "Oswald", sans-serif`;
      ctx.textAlign = "center";
      // Truncate name to fit under icon
      let display = name;
      while (ctx.measureText(display).width > ICON && display.length > 3) {
        display = display.slice(0, -1);
      }
      if (display !== name) display = display.trimEnd() + "…";
      ctx.fillText(display, x + ICON / 2, ICON_Y + ICON + 16);
      ctx.textAlign = "left";
    }
  });

  downloadCanvas(canvas, `bloodweb-build-${role}.png`);
}

export async function exportTierListImage(
  perks: Perk[],
  ratings: Record<string, Grade>,
  role: "survivor" | "killer",
): Promise<void> {
  await document.fonts.ready;

  const grades = (Object.keys(GRADE_ORDER) as Grade[]).sort(
    (a, b) => GRADE_ORDER[a] - GRADE_ORDER[b],
  );

  const W = 900;
  const PAD = 24;
  const ICON = 64;
  const ICON_GAP = 8;
  const NAME_H = 16;
  const CELL_W = ICON + ICON_GAP;
  const CELL_H = ICON + NAME_H + 6;
  const ICONS_PER_ROW = Math.floor((W - PAD * 2 - 48) / CELL_W);
  const GRADE_LABEL_W = 48;
  const HEADER_H = 56;
  const ROW_PAD = 12;

  // Group perks by grade
  const grouped: Partial<Record<Grade, Perk[]>> = {};
  for (const perk of perks) {
    const grade = ratings[perk.name];
    if (!grade) continue;
    if (!grouped[grade]) grouped[grade] = [];
    grouped[grade]!.push(perk);
  }

  const activeGrades = grades.filter((g) => (grouped[g]?.length ?? 0) > 0);
  if (activeGrades.length === 0) return;

  // Calculate total canvas height
  let totalH = HEADER_H;
  for (const grade of activeGrades) {
    const count = grouped[grade]!.length;
    const rows = Math.ceil(count / ICONS_PER_ROW);
    totalH += ROW_PAD + rows * CELL_H + ROW_PAD;
  }
  totalH += PAD;

  // Load all images
  const allPerks = activeGrades.flatMap((g) => grouped[g]!);
  const imageMap = new Map<string, HTMLImageElement | null>();
  await Promise.all(
    allPerks.map(async (p) => {
      imageMap.set(p.name, await loadImage(getPerkImageUrl(p.image)));
    }),
  );

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, totalH);

  // Header
  ctx.fillStyle = EMBER;
  ctx.font = `600 18px "Cinzel", serif`;
  ctx.letterSpacing = "3px";
  ctx.textBaseline = "middle";
  ctx.fillText(`${role.toUpperCase()} TIER LIST`, PAD, HEADER_H / 2);
  ctx.letterSpacing = "0px";
  ctx.textBaseline = "alphabetic";

  // Separator line under header
  ctx.strokeStyle = "#2a1f10";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, HEADER_H - 4);
  ctx.lineTo(W - PAD, HEADER_H - 4);
  ctx.stroke();

  let y = HEADER_H;

  for (const grade of activeGrades) {
    const gradePerks = grouped[grade]!;
    const color = GRADE_COLORS[grade];
    const rows = Math.ceil(gradePerks.length / ICONS_PER_ROW);
    const sectionH = ROW_PAD + rows * CELL_H + ROW_PAD;

    // Subtle row background
    ctx.fillStyle = CARD_BG;
    ctx.fillRect(0, y, W, sectionH);

    // Grade color bar
    ctx.fillStyle = color;
    ctx.fillRect(0, y, 4, sectionH);

    // Grade letter
    ctx.fillStyle = color;
    ctx.font = `700 28px "Cinzel", serif`;
    ctx.textBaseline = "middle";
    ctx.fillText(grade, PAD, y + sectionH / 2);
    ctx.textBaseline = "alphabetic";

    const iconsStartX = PAD + GRADE_LABEL_W;

    gradePerks.forEach((perk, idx) => {
      const row = Math.floor(idx / ICONS_PER_ROW);
      const col = idx % ICONS_PER_ROW;
      const ix = iconsStartX + col * CELL_W;
      const iy = y + ROW_PAD + row * CELL_H;
      const img = imageMap.get(perk.name);

      if (img) {
        ctx.save();
        roundRect(ctx, ix, iy, ICON, ICON, 5);
        ctx.clip();
        ctx.drawImage(img, ix, iy, ICON, ICON);
        ctx.restore();
      } else {
        ctx.fillStyle = SLOT_EMPTY_BG;
        roundRect(ctx, ix, iy, ICON, ICON, 5);
        ctx.fill();
      }

      // Perk name
      ctx.fillStyle = PARCHMENT_DIM;
      ctx.font = `400 9px "Oswald", sans-serif`;
      ctx.textAlign = "center";
      let display = perk.name;
      while (ctx.measureText(display).width > ICON && display.length > 3) {
        display = display.slice(0, -1);
      }
      if (display !== perk.name) display = display.trimEnd() + "…";
      ctx.fillText(display, ix + ICON / 2, iy + ICON + 12);
      ctx.textAlign = "left";
    });

    y += sectionH;
  }

  downloadCanvas(canvas, `bloodweb-tierlist-${role}.png`);
}
