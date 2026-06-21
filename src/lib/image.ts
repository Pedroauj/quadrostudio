// Client-side image compression for brand assets. Stores result as data URL.

export async function compressImage(
  file: File,
  opts: { maxW: number; maxH: number; quality?: number; mime?: string } = { maxW: 1600, maxH: 1600 },
): Promise<string> {
  const { maxW, maxH, quality = 0.82, mime = "image/jpeg" } = opts;
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("Arquivo maior que 25 MB.");
  }
  const bitmap = await fileToBitmap(file);
  const ratio = Math.min(maxW / bitmap.width, maxH / bitmap.height, 1);
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  // For PNG with transparency we keep PNG; for everything else convert to JPEG.
  const isPng = file.type === "image/png" && mime === "image/png";
  if (!isPng) {
    ctx.fillStyle = "#0b0b0d";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL(mime, quality);
}

async function fileToBitmap(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function loadImageDims(src: string): Promise<{ w: number; h: number }> {
  const img = new Image();
  img.src = src;
  await img.decode();
  return { w: img.naturalWidth, h: img.naturalHeight };
}