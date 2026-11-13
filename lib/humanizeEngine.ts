import sharp from "sharp";
import fs from "fs";
import path from "path";
// @ts-ignore
import piexif from "piexifjs";

export interface HumanizeOptions {
  rugIndex?: number;
  photoIndex?: number;
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  includeWatermark?: boolean;
}

export function generateRealisticDateTime(rugIndex = 0, photoIndex = 0): string {
  const daysAgo = Math.max(3, 35 - Math.floor(rugIndex * 0.7));
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - daysAgo);

  const shootHour = 10 + ((rugIndex * 2 + 1) % 6);
  const shootMinute = 15 + ((rugIndex * 13 + photoIndex * 2) % 40);
  const shootSecond = 10 + ((photoIndex * 19) % 45);

  baseDate.setHours(shootHour, shootMinute, shootSecond, 0);

  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = baseDate.getFullYear();
  const mm = pad(baseDate.getMonth() + 1);
  const dd = pad(baseDate.getDate());
  const hh = pad(baseDate.getHours());
  const min = pad(baseDate.getMinutes());
  const ss = pad(baseDate.getSeconds());

  return `${yyyy}:${mm}:${dd} ${hh}:${min}:${ss}`;
}

export function getCameraSettings(rugIndex = 0, photoIndex = 0) {
  const shutterSpeeds = [
    { fraction: "1/160s", val: [1, 160] },
    { fraction: "1/200s", val: [1, 200] },
    { fraction: "1/125s", val: [1, 125] },
    { fraction: "1/250s", val: [1, 250] },
  ];
  const apertures = [
    { fStop: "f/1.4", val: [14, 10] },
    { fStop: "f/1.8", val: [18, 10] },
    { fStop: "f/2.8", val: [28, 10] },
    { fStop: "f/4.0", val: [40, 10] },
  ];
  const isos = [200, 320, 400, 250];

  const dateStr = generateRealisticDateTime(rugIndex, photoIndex);
  const shutter = shutterSpeeds[(rugIndex + photoIndex) % shutterSpeeds.length];
  const aperture = apertures[(rugIndex * 2 + photoIndex) % apertures.length];
  const iso = isos[(rugIndex + photoIndex * 2) % isos.length];

  return {
    camera: "SONY ILCE-7M4",
    lens: "FE 50mm F1.4 GM",
    shootDate: dateStr,
    shutter,
    aperture,
    iso,
    gps: "Bhadohi, Uttar Pradesh, India (25°23'N, 82°34'E)",
  };
}

export async function humanizeImageBuffer(
  inputBuffer: Buffer,
  options: HumanizeOptions = {}
): Promise<Buffer> {
  const {
    rugIndex = 0,
    photoIndex = 0,
    cameraMake = "SONY",
    cameraModel = "ILCE-7M4",
    lensModel = "FE 50mm F1.4 GM",
    includeWatermark = true,
  } = options;

  const meta = await sharp(inputBuffer).metadata();
  const targetWidth = Math.min(meta.width || 2400, 2400);
  const targetHeight = Math.round((meta.height || 1800) * (targetWidth / (meta.width || 2400)));

  // 1. Procedural 2.8% organic sensor micro-grain (ISO 400 simulation)
  const noiseSvg = `
    <svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.028 0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)"/>
    </svg>
  `;

  const compositeLayers: any[] = [];
  const grainPng = await sharp(Buffer.from(noiseSvg)).png().toBuffer();
  compositeLayers.push({ input: grainPng, blend: "overlay" });

  // 2. Luxury Studio Atelier Logo Watermark in bottom-right corner (low opacity)
  if (includeWatermark) {
    const logoPath = path.join(process.cwd(), "public", "watermark-logo.png");
    if (fs.existsSync(logoPath)) {
      const logoBuf = fs.readFileSync(logoPath);
      const logoB64 = logoBuf.toString("base64");

      const logoSize = Math.max(120, Math.round(targetWidth * 0.088));
      const rightMargin = Math.round(targetWidth * 0.025);
      const bottomMargin = Math.round(targetHeight * 0.03);
      const posX = targetWidth - logoSize - rightMargin;
      const posY = targetHeight - logoSize - bottomMargin;
      const opacity = 0.60; // Increased opacity for clearer, distinct watermark branding

      const watermarkSvg = `
        <svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g opacity="${opacity}">
            <image xlink:href="data:image/png;base64,${logoB64}" x="${posX}" y="${posY}" width="${logoSize}" height="${logoSize}" />
          </g>
        </svg>
      `;
      const watermarkPng = await sharp(Buffer.from(watermarkSvg)).png().toBuffer();
      compositeLayers.push({ input: watermarkPng, blend: "over" });
    } else {
      const fontSize = Math.max(18, Math.round(targetWidth * 0.0125));
      const rightMargin = Math.round(targetWidth * 0.022);
      const bottomMargin = Math.round(targetHeight * 0.022);

      const watermarkSvg = `
        <svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
          <text 
            x="${targetWidth - rightMargin}" 
            y="${targetHeight - bottomMargin}" 
            font-family="Georgia, 'Times New Roman', serif" 
            font-size="${fontSize}" 
            letter-spacing="1.5" 
            fill="rgba(255, 255, 255, 0.45)" 
            text-anchor="end"
            style="text-shadow: 0 1px 3px rgba(0,0,0,0.6), 0 0 1px rgba(0,0,0,0.9);"
          >
            NR Enterprises Atelier • Bhadohi • Handcrafted in Pure Wool
          </text>
        </svg>
      `;
      const watermarkPng = await sharp(Buffer.from(watermarkSvg)).png().toBuffer();
      compositeLayers.push({ input: watermarkPng, blend: "over" });
    }
  }

  const processedJpegBuffer = await sharp(inputBuffer)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .composite(compositeLayers)
    .jpeg({ quality: 93, chromaSubsampling: "4:4:4" })
    .toBuffer();

  const settings = getCameraSettings(rugIndex, photoIndex);

  const zeroth: any = {};
  const exif: any = {};
  const gps: any = {};

  zeroth[piexif.ImageIFD.Make] = cameraMake;
  zeroth[piexif.ImageIFD.Model] = cameraModel;
  zeroth[piexif.ImageIFD.Software] = `${cameraModel} v2.00`;
  zeroth[piexif.ImageIFD.DateTime] = settings.shootDate;
  zeroth[piexif.ImageIFD.Artist] = "NR Enterprises Atelier Bhadohi";
  zeroth[piexif.ImageIFD.Copyright] = "NR Enterprises Handmade Carpets";

  exif[piexif.ExifIFD.DateTimeOriginal] = settings.shootDate;
  exif[piexif.ExifIFD.DateTimeDigitized] = settings.shootDate;
  exif[piexif.ExifIFD.LensMake] = cameraMake;
  exif[piexif.ExifIFD.LensModel] = lensModel;
  exif[piexif.ExifIFD.FocalLength] = [50, 1];
  exif[piexif.ExifIFD.FNumber] = settings.aperture.val;
  exif[piexif.ExifIFD.ExposureTime] = settings.shutter.val;
  exif[piexif.ExifIFD.ISOSpeedRatings] = settings.iso;
  exif[piexif.ExifIFD.MeteringMode] = 5;
  exif[piexif.ExifIFD.LightSource] = 1;
  exif[piexif.ExifIFD.Flash] = 16;
  exif[piexif.ExifIFD.ColorSpace] = 1;

  gps[piexif.GPSIFD.GPSLatitudeRef] = "N";
  gps[piexif.GPSIFD.GPSLatitude] = [
    [25, 1],
    [23, 1],
    [850, 100],
  ];
  gps[piexif.GPSIFD.GPSLongitudeRef] = "E";
  gps[piexif.GPSIFD.GPSLongitude] = [
    [82, 1],
    [34, 1],
    [1720, 100],
  ];

  const exifObj = { "0th": zeroth, Exif: exif, GPS: gps };
  const exifBytes = piexif.dump(exifObj);

  const binaryJpeg = processedJpegBuffer.toString("binary");
  const insertedBinary = piexif.insert(exifBytes, binaryJpeg);

  return Buffer.from(insertedBinary, "binary");
}