import sharp, { type OverlayOptions } from "sharp";
import path from "path";
import { existsSync } from "fs";

const LOGO_PATH = path.join(process.cwd(), "public", "brand", "fotossurf-logo.png");

export type ProcessedImages = {
  original: Buffer;
  watermark: Buffer;
  thumb: Buffer;
  width: number;
  height: number;
};

export async function processPhoto(input: Buffer): Promise<ProcessedImages> {
  const image = sharp(input).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const maxPreview = 1600;
  const previewBase = await sharp(input)
    .rotate()
    .resize({
      width: width > height ? maxPreview : undefined,
      height: height >= width ? maxPreview : undefined,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82 })
    .toBuffer();

  const previewMeta = await sharp(previewBase).metadata();
  const pw = previewMeta.width ?? 1200;
  const ph = previewMeta.height ?? 800;

  let watermarked = previewBase;
  if (existsSync(LOGO_PATH)) {
    const logoSize = Math.round(Math.min(pw, ph) * 0.28);
    const logo = await sharp(LOGO_PATH)
      .resize({ width: logoSize, height: logoSize, fit: "inside" })
      .png()
      .toBuffer();

    const tiled = await tileWatermark(logo, pw, ph);
    watermarked = await sharp(previewBase)
      .composite([{ input: tiled, blend: "over" }])
      .jpeg({ quality: 80 })
      .toBuffer();
  } else {
    // Fallback text band if logo missing
    const svg = Buffer.from(
      `<svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="50%" text-anchor="middle" fill="rgba(255,255,255,0.35)"
          font-size="${Math.round(pw / 18)}" font-family="Arial" font-style="italic"
          transform="rotate(-25, ${pw / 2}, ${ph / 2})">FOTOSSSURF</text>
      </svg>`,
    );
    watermarked = await sharp(previewBase)
      .composite([{ input: svg, blend: "over" }])
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  const thumb = await sharp(watermarked)
    .resize({ width: 480, height: 480, fit: "inside" })
    .jpeg({ quality: 75 })
    .toBuffer();

  const original = await sharp(input)
    .rotate()
    .jpeg({ quality: 95 })
    .toBuffer();

  return { original, watermark: watermarked, thumb, width, height };
}

async function tileWatermark(
  logo: Buffer,
  width: number,
  height: number,
): Promise<Buffer> {
  const logoMeta = await sharp(logo).metadata();
  const lw = logoMeta.width ?? 120;
  const lh = logoMeta.height ?? 120;
  const gapX = Math.round(lw * 1.8);
  const gapY = Math.round(lh * 1.8);
  const fadedLogo = await sharp(logo)
    .ensureAlpha(0.22)
    .png()
    .toBuffer();

  const fadedComposites: OverlayOptions[] = [];
  for (let y = Math.round(lh * 0.3); y < height; y += gapY) {
    const offset = Math.floor(y / gapY) % 2 === 0 ? 0 : Math.round(gapX / 2);
    for (let x = -lw + offset; x < width + lw; x += gapX) {
      fadedComposites.push({
        input: fadedLogo,
        left: Math.max(0, Math.round(x)),
        top: Math.max(0, Math.round(y)),
      });
    }
  }

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(fadedComposites)
    .png()
    .toBuffer();
}
