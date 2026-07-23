import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs"; // sharp edge'de değil, Node runtime ister

const SUPPORTED = ["jpeg", "png", "webp", "avif", "gif", "tiff"] as const;
type Target = (typeof SUPPORTED)[number];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const target = String(form.get("target") || "").toLowerCase() as Target;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }
    if (!SUPPORTED.includes(target)) {
      return NextResponse.json({ error: "Geçersiz hedef format." }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(input);

    switch (target) {
      case "jpeg": pipeline = pipeline.jpeg({ quality: 90 }); break;
      case "png":  pipeline = pipeline.png(); break;
      case "webp": pipeline = pipeline.webp({ quality: 90 }); break;
      case "avif": pipeline = pipeline.avif({ quality: 60 }); break;
      case "gif":  pipeline = pipeline.gif(); break;
      case "tiff": pipeline = pipeline.tiff(); break;
    }

    const output = await pipeline.toBuffer();
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const ext = target === "jpeg" ? "jpg" : target;

    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": `image/${target}`,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(baseName)}.${ext}`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Dönüştürme başarısız." }, { status: 500 });
  }
}