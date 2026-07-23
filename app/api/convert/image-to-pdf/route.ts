import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

const A4 = { w: 595.28, h: 841.89 }; // points
const MARGIN = 20;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "En az bir görsel seçin." }, { status: 400 });
    }

    const pdf = await PDFDocument.create();

    for (const file of files) {
      const input = Buffer.from(await file.arrayBuffer());
      // Her formatı (webp, avif, png...) JPEG'e normalize et — pdf-lib sadece jpg/png gömer
      const jpg = await sharp(input)
        .flatten({ background: "#ffffff" }) // şeffaflığı beyaz yap
        .jpeg({ quality: 90 })
        .toBuffer();

      const img = await pdf.embedJpg(jpg);
      const page = pdf.addPage([A4.w, A4.h]);

      // A4'e sığdır, oranı koru, ortala
      const maxW = A4.w - MARGIN * 2;
      const maxH = A4.h - MARGIN * 2;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;

      page.drawImage(img, {
        x: (A4.w - w) / 2,
        y: (A4.h - h) / 2,
        width: w,
        height: h,
      });
    }

    const bytes = await pdf.save();

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent("donusturulen")}.pdf`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "PDF oluşturma başarısız." }, { status: 500 });
  }
}