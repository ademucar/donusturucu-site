import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "PDF dosyası seçin." }, { status: 400 });
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    const baseName = file.name.replace(/\.[^.]+$/, "");

    const mupdf = await import("mupdf");
    const doc = mupdf.Document.openDocument(buf, "application/pdf");
    const pageCount = doc.countPages();

    const images: { name: string; data: Uint8Array }[] = [];
    for (let i = 0; i < pageCount; i++) {
      const page = doc.loadPage(i);
      const pixmap = page.toPixmap(mupdf.Matrix.scale(2, 2), mupdf.ColorSpace.DeviceRGB);
      images.push({ name: `${baseName}-sayfa-${i + 1}.png`, data: pixmap.asPNG() });
    }

    if (images.length === 0) {
      return NextResponse.json({ error: "PDF'te sayfa bulunamadı." }, { status: 400 });
    }
    if (images.length === 1) {
      return new NextResponse(new Uint8Array(images[0].data), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(images[0].name)}`,
        },
      });
    }

    const zip = new JSZip();
    images.forEach((img) => zip.file(img.name, img.data));
    const zipBytes = await zip.generateAsync({ type: "uint8array" });
    return new NextResponse(new Uint8Array(zipBytes), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(baseName)}.zip`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "PDF dönüştürme başarısız." }, { status: 500 });
  }
}