"use client";
import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";

export default function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConvert() {
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      const res = await fetch("/api/convert/image-to-pdf", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "PDF oluşturma başarısız.");
      }
      downloadBlob(await res.blob(), "donusturulen.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      title="Görsellerden"
      accent="PDF"
      subtitle="Birden fazla görsel seçin; her biri tek bir PDF'te ayrı sayfa olur."
      steps={["Dosya Seç", "PDF Oluştur"]}
      current={files.length ? 2 : 1}
    >
      <Dropzone accept="image/*" multiple files={files} onFiles={setFiles} />
      <PrimaryButton onClick={handleConvert} disabled={files.length === 0 || loading}>
        {loading ? "Oluşturuluyor..." : "PDF Oluştur"}
      </PrimaryButton>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}