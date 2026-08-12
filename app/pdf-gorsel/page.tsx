"use client";
import { useState } from "react";
import JSZip from "jszip";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConvert() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const pdfjs = await import("pdfjs-dist");
      // worker'ı paketten yerel olarak yükle (CDN'e/ağ bağlantısına ihtiyaç yok)
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const buf = await file.arrayBuffer();
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const pdf = await pdfjs.getDocument({ data: buf }).promise;

      const images: { name: string; data: Blob }[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        // pdfjs v6: `canvas` ile `canvasContext` birlikte verilemez.
        await page.render({ canvas, viewport }).promise;
        const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
        if (blob) images.push({ name: `${baseName}-sayfa-${i}.png`, data: blob });
      }

      if (images.length === 0) throw new Error("PDF'te sayfa bulunamadı.");
      if (images.length === 1) {
        downloadBlob(images[0].data, images[0].name);
      } else {
        const zip = new JSZip();
        images.forEach((img) => zip.file(img.name, img.data));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, `${baseName}.zip`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      title="PDF'ten"
      accent="Görsel'e"
      subtitle="Her sayfa ayrı PNG olur. Çok sayfalıysa ZIP olarak iner."
      steps={["Dosya Seç", "Görsele Çevir"]}
      current={file ? 2 : 1}
    >
      <Dropzone accept="application/pdf" files={file ? [file] : []} onFiles={(f) => setFile(f[0] ?? null)} />
      <PrimaryButton onClick={handleConvert} disabled={!file || loading}>
        {loading ? "Dönüştürülüyor..." : "Görsele Çevir"}
      </PrimaryButton>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}