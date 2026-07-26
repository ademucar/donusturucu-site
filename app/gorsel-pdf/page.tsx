"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";

const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 20;

async function fileToPngBytes(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  if (!blob) throw new Error("Görsel işlenemedi.");
  return new Uint8Array(await blob.arrayBuffer());
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
        const png = await fileToPngBytes(file);
        const img = await pdf.embedPng(png);
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