import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

function parsePages(input: string, total: number): number[] {
  const set = new Set<number>();
  for (const part of input.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      let a = parseInt(m[1]), b = parseInt(m[2]);
      if (a > b) [a, b] = [b, a];
      for (let i = a; i <= b; i++) if (i >= 1 && i <= total) set.add(i - 1);
    } else if (/^\d+$/.test(part)) {
      const n = parseInt(part);
      if (n >= 1 && n <= total) set.add(n - 1);
    }
  }
  return [...set].sort((a, b) => a - b);
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const mode = String(form.get("mode") || "keep");
    const pagesStr = String(form.get("pages") || "");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "PDF seçin." }, { status: 400 });
    }
    const src = await PDFDocument.load(await file.arrayBuffer());
    const total = src.getPageCount();
    const selected = parsePages(pagesStr, total);
    if (selected.length === 0) {
      return NextResponse.json({ error: "Geçerli sayfa numarası girin (örn: 1,3,5-7)." }, { status: 400 });
    }

    let indices: number[];
    if (mode === "remove") {
      const removeSet = new Set(selected);
      indices = Array.from({ length: total }, (_, i) => i).filter((i) => !removeSet.has(i));
    } else {
      indices = selected;
    }
    if (indices.length === 0) {
      return NextResponse.json({ error: "Sonuçta hiç sayfa kalmıyor." }, { status: 400 });
    }

    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, indices);
    copied.forEach((p) => out.addPage(p));
    const bytes = await out.save();
    const base = file.name.replace(/\.[^.]+$/, "");

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(base)}-duzenlenmis.pdf`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}