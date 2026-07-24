"use client";
import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";

const FORMATS = [
  { value: "jpeg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
  { value: "gif", label: "GIF" },
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState("png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConvert() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("target", target);
      const res = await fetch("/api/convert/image", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Dönüştürme başarısız.");
      }
      const base = file.name.replace(/\.[^.]+$/, "");
      downloadBlob(await res.blob(), `${base}.${target === "jpeg" ? "jpg" : target}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      title="Görselinizi"
      accent="Dönüştürün"
      subtitle="JPG, PNG, WebP, AVIF, GIF ve TIFF arasında hızlıca çevirin."
      steps={["Dosya Seç", "Format Seç", "Dönüştür"]}
      current={loading ? 3 : file ? 2 : 1}
    >
      <Dropzone accept="image/*" files={file ? [file] : []} onFiles={(f) => setFile(f[0] ?? null)} />

      <div className="mt-5">
        <label className="mb-2 block text-sm text-slate-400">Hedef format</label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 outline-none focus:border-violet-400/60"
        >
          {FORMATS.map((f) => <option key={f.value} value={f.value} className="bg-slate-900">{f.label}</option>)}
        </select>
      </div>

      <PrimaryButton onClick={handleConvert} disabled={!file || loading}>
        {loading ? "Dönüştürülüyor..." : "Dönüştür"}
      </PrimaryButton>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}