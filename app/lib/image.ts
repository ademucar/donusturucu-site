export const HEIC_RE = /\.(heic|heif)$/i;

export function isHeic(file: File): boolean {
  return HEIC_RE.test(file.name) || /heic|heif/i.test(file.type);
}

/**
 * HEIC/HEIF dosyalarını tarayıcının çözebileceği bir JPEG blob'una çevirir.
 * Diğer formatlar olduğu gibi döner.
 */
export async function decodeToDrawable(file: File): Promise<Blob> {
  if (!isHeic(file)) return file;
  try {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.95 });
    return Array.isArray(converted) ? converted[0] : converted;
  } catch {
    throw new Error("HEIC dosyası açılamadı. Dosya bozuk veya desteklenmeyen bir türde olabilir.");
  }
}

/** Kayıpsız formatlar kalite parametresini yok sayar. */
export function isLossy(mime: string): boolean {
  return mime === "image/jpeg" || mime === "image/webp";
}

export function extFor(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "png";
}

/** Girdi formatını koru; desteklenmiyorsa PNG'ye düş. */
export function outputTypeFor(file: File): string {
  if (isHeic(file)) return "image/jpeg";
  if (file.type === "image/jpeg" || file.type === "image/webp" || file.type === "image/png") {
    return file.type;
  }
  return "image/png";
}

const FORMAT_LABELS: Record<string, string> = {
  "image/webp": "WebP",
  "image/jpeg": "JPG",
  "image/png": "PNG",
};

/**
 * Tarayıcı desteklemediği bir hedef format istendiğinde toBlob hata vermez,
 * sessizce PNG döndürür. Bu da yanlış uzantılı bozuk dosya demek olur.
 * Üretilen türü kontrol edip anlaşılır bir hata veriyoruz.
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, quality));
  if (!blob) throw new Error("Görsel oluşturulamadı.");
  if (blob.type !== type) {
    const label = FORMAT_LABELS[type] ?? type;
    throw new Error(`Tarayıcınız ${label} formatında kayıt desteklemiyor. Başka bir format seçin.`);
  }
  return blob;
}

/** Hedef formatın bu tarayıcıda gerçekten üretilebildiğini ucuza doğrular. */
async function assertFormatSupported(format: string): Promise<void> {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  await canvasToBlob(probe, format);
}

/**
 * Canvas sınırı aşıldığında bazı tarayıcılar hata vermez, canvas'ı boş bırakır.
 * JPEG yolunda zemini beyaza boyadığımız için saydamlık = başarısız çizim demek.
 */
function looksBlank(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const points: [number, number][] = [
    [0, 0],
    [Math.floor(w / 2), Math.floor(h / 2)],
    [w - 1, h - 1],
  ];
  return points.every(([x, y]) => ctx.getImageData(x, y, 1, 1).data[3] === 0);
}

const SCALE_STEPS = [1, 0.75, 0.5, 0.35, 0.25];

/**
 * Cihazın canvas sınırını aşan görsellerde sessizce çökmek yerine kademeli
 * küçülterek yeniden dener. `reduced` true ise çıktı istenenden küçüktür.
 */
export async function renderWithFallback(
  targetW: number,
  targetH: number,
  format: string,
  quality: number | undefined,
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): Promise<RenderResult> {
  await assertFormatSupported(format);

  let lastError: unknown = null;
  for (const scale of SCALE_STEPS) {
    const w = Math.max(1, Math.round(targetW * scale));
    const h = Math.max(1, Math.round(targetH * scale));
    const canvas = document.createElement("canvas");
    try {
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas oluşturulamadı.");
      paint(ctx, w, h);
      if (format === "image/jpeg" && looksBlank(ctx, w, h)) {
        throw new Error("Canvas sınırı aşıldı.");
      }
      const blob = await canvasToBlob(canvas, format, quality);
      return { blob, width: w, height: h, reduced: scale < 1 };
    } catch (e) {
      lastError = e;
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Görsel bu cihaz için fazla büyük.");
}

export type Rect = { x: number; y: number; width: number; height: number };

export type RenderOptions = {
  /** Ekranda görünen boyuta göre kırpma alanı; yoksa görselin tamamı. */
  crop?: Rect | null;
  maxWidth?: number | null;
  maxHeight?: number | null;
  format: string;
  quality?: number;
};

export type RenderResult = {
  blob: Blob;
  width: number;
  height: number;
  /** Cihaz sınırı nedeniyle çıktı istenenden küçük üretildiyse true. */
  reduced?: boolean;
};

export async function renderImage(
  img: HTMLImageElement,
  o: RenderOptions
): Promise<RenderResult | null> {
  if (!img.naturalWidth) return null;

  // ReactCrop piksel değerleri ekrandaki boyuta göre gelir; gerçek boyuta ölçekle
  const sx = img.naturalWidth / img.width;
  const sy = img.naturalHeight / img.height;

  let cx = 0;
  let cy = 0;
  let cw = img.naturalWidth;
  let ch = img.naturalHeight;
  if (o.crop && o.crop.width > 1 && o.crop.height > 1) {
    cx = o.crop.x * sx;
    cy = o.crop.y * sy;
    cw = o.crop.width * sx;
    ch = o.crop.height * sy;
  }

  // En-boy oranını koruyarak sınırlara sığdır
  let outW = cw;
  let outH = ch;
  const mw = o.maxWidth && o.maxWidth > 0 ? o.maxWidth : null;
  const mh = o.maxHeight && o.maxHeight > 0 ? o.maxHeight : null;
  if (mw || mh) {
    const scale = Math.min(mw ? mw / cw : Infinity, mh ? mh / ch : Infinity);
    if (scale < 1) {
      outW = cw * scale;
      outH = ch * scale;
    }
  }

  return renderWithFallback(
    Math.max(1, Math.round(outW)),
    Math.max(1, Math.round(outH)),
    o.format,
    isLossy(o.format) ? (o.quality ?? 90) / 100 : undefined,
    (ctx, w, h) => {
      ctx.imageSmoothingQuality = "high";
      if (o.format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, cx, cy, cw, ch, 0, 0, w, h);
    }
  );
}
