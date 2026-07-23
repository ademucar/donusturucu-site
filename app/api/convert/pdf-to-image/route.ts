import { NextRequest, NextResponse } from "next/server";
import { pdf } from "pdf-to-img";
import JSZip from "jszip";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "PDF dosyası seçin." }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const baseName = file.name.replace(/\.[^.]+$/, "");

    // Her sayfayı PNG buffer olarak üret (scale=2 => daha net)
    const document = await pdf(buf, { scale: 2 });

    const images: { name: string; data: Buffer }[] = [];
    let i = 1;
    for await (const page of document) {
      images.push({ name: `${baseName}-sayfa-${i}.png`, data: page });
      i++;
    }

    if (images.length === 0) {
      return NextResponse.json({ error: "PDF'te sayfa bulunamadı." }, { status: 400 });
    }

    // Tek sayfa => direkt PNG
    if (images.length === 1) {
      return new NextResponse(new Uint8Array(images[0].data), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(images[0].name)}`,
        },
      });
    }

    // Çok sayfa => ZIP
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