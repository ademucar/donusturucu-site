"use client";
import { useState } from "react";
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
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/convert/pdf-to-image", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Dönüştürme başarısız.");
      }
      const isZip = (res.headers.get("Content-Type") || "").includes("zip");
      const base = file.name.replace(/\.[^.]+$/, "");
      downloadBlob(await res.blob(), isZip ? `${base}.zip` : `${base}-sayfa-1.png`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      title="PDF'ten"
      accent="Görsel"
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