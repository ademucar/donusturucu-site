import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length < 2) {
      return NextResponse.json({ error: "Birleştirmek için en az 2 PDF seçin." }, { status: 400 });
    }

    const merged = await PDFDocument.create();
    for (const file of files) {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }
    const bytes = await merged.save();

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent("birlestirilmis")}.pdf`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "İşlem başarısız. PDF şifreli veya bozuk olabilir." }, { status: 500 });
  }
}