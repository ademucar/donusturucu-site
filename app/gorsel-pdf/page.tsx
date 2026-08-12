"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";

const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 20;

type EmbedImage = { bytes: Uint8Array; format: "png" | "jpg" };

async function fileToEmbedImage(file: File): Promise<EmbedImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  // JPEG fotoğrafları JPEG olarak yeniden kodla (çok daha küçük PDF); diğerleri PNG.
  const asJpeg = file.type === "image/jpeg" || file.type === "image/jpg";
  if (asJpeg) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  const type = asJpeg ? "image/jpeg" : "image/png";
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.92));
  if (!blob) throw new Error("Görsel işlenemedi.");
  return { bytes: new Uint8Array(await blob.arrayBuffer()), format: asJpeg ? "jpg" : "png" };
}

export default function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConvert() {
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const pdf = await PDFDocument.create();
      for (const file of files) {
        const { bytes, format } = await fileToEmbedImage(file);
        const img = format === "jpg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
        const page = pdf.addPage([A4.w, A4.h]);
        const maxW = A4.w - MARGIN * 2;
        const maxH = A4.h - MARGIN * 2;
        const scale = Math.min(maxW / img.width, maxH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        page.drawImage(img, { x: (A4.w - w) / 2, y: (A4.h - h) / 2, width: w, height: h });
      }
      const bytes = await pdf.save();
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), "donusturulen.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="Görsellerden" accent="PDF'e" subtitle="Birden fazla görsel seçin; her biri ayrı sayfa olur.Tek bir PDF dosyası haline gelir." steps={["Dosya Seç", "PDF Oluştur"]} current={files.length ? 2 : 1}>
      <Dropzone accept="image/*" multiple files={files} onFiles={setFiles} />
      <PrimaryButton onClick={handleConvert} disabled={files.length === 0 || loading}>{loading ? "Oluşturuluyor..." : "PDF Oluştur"}</PrimaryButton>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}