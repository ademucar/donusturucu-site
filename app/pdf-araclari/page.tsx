"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    setError("");
    if (files.length < 2) { setError("Birleştirmek için en az 2 PDF seçin."); return; }
    setLoading(true);
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const src = await PDFDocument.load(await file.arrayBuffer());
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), "birlestirilmis.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="PDF" accent="Birleştir" subtitle="Birden fazla PDF seçin; seçtiğiniz sırayla tek PDF olur. Cihazınızda işlenir." steps={["Dosya Seç", "Birleştir"]} current={files.length ? 2 : 1}>
      <Dropzone accept="application/pdf" multiple files={files} onFiles={setFiles} />
      <PrimaryButton onClick={handleRun} disabled={loading}>{loading ? "Birleştiriliyor..." : "Birleştir"}</PrimaryButton>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}