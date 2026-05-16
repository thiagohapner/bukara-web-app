import sharp from "sharp";

export async function processImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .withMetadata({ exif: {} })
    .toBuffer();
}
