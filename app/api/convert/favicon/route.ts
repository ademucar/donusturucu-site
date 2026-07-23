import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import pngToIco from "png-to-ico";
import JSZip from "jszip";

export const runtime = "nodejs";

const SIZES = [16, 32, 48, 64, 128, 180, 192, 512];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Görsel seçin." }, { status: 400 });
    }
    const input = Buffer.from(await file.arrayBuffer());

    const pngs: Record<number, Buffer> = {};
    for (const size of SIZES) {
      pngs[size] = await sharp(input)
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    }

    const ico = await pngToIco([pngs[16], pngs[32], pngs[48]]);

    const zip = new JSZip();
    zip.file("favicon.ico", ico);
    zip.file("apple-touch-icon.png", pngs[180]);
    for (const size of SIZES) zip.file(`favicon-${size}x${size}.png`, pngs[size]);
    const zipBytes = await zip.generateAsync({ type: "uint8array" });

    return new NextResponse(new Uint8Array(zipBytes), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename*=UTF-8''favicon-paketi.zip`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Favicon oluşturma başarısız." }, { status: 500 });
  }
}