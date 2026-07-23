import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const quality = Math.min(100, Math.max(10, Number(form.get("quality") || 80)));
    const width = Number(form.get("width")) || undefined;
    const height = Number(form.get("height")) || undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Görsel seçin." }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());
    let img = sharp(input);
    const meta = await img.metadata();

    if (width || height) {
      img = img.resize({ width, height, fit: "inside", withoutEnlargement: true });
    }

    let outExt: string;
    const fmt = String(meta.format);
    if (fmt === "png") {
      img = img.png({ compressionLevel: 9, palette: true, quality });
      outExt = "png";
    } else if (fmt === "webp") {
      img = img.webp({ quality });
      outExt = "webp";
    } else if (fmt === "avif") {
      img = img.avif({ quality });
      outExt = "avif";
    } else if (fmt === "tiff") {
      img = img.tiff({ quality });
      outExt = "tiff";
    } else {
      img = img.jpeg({ quality }); // jpeg, gif, svg vb.
      outExt = "jpg";
    }

    const output = await img.toBuffer();
    const base = file.name.replace(/\.[^.]+$/, "");
    const contentType = outExt === "jpg" ? "image/jpeg" : `image/${outExt}`;

    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(base)}-optimize.${outExt}`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}