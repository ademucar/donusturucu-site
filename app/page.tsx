"use client";
import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";

const FORMATS = [
  { value: "image/jpeg", label: "JPG / JPEG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState("image/png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConvert() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const fmt = FORMATS.find((f) => f.value === target)!;
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      if (target === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, target, 0.92));
      if (!blob) throw new Error("Dönüştürme başarısız.");
      const base = file.name.replace(/\.[^.]+$/, "");
      downloadBlob(blob, `${base}.${fmt.ext}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="Görselinizi" accent="Dönüştürün" subtitle="JPG, PNG ve WebP arasında hızlıca çevirin. Dosya cihazınızda işlenir." steps={["Dosya Seç", "Format Seç", "Dönüştür"]} current={loading ? 3 : file ? 2 : 1}>
      <Dropzone accept="image/*" files={file ? [file] : []} onFiles={(f) => setFile(f[0] ?? null)} />
      <div className="mt-5">
        <label className="mb-2 block text-sm text-slate-400">Hedef format</label>
        <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 outline-none focus:border-violet-400/60">
          {FORMATS.map((f) => <option key={f.value} value={f.value} className="bg-slate-900">{f.label}</option>)}
        </select>
      </div>
      <PrimaryButton onClick={handleConvert} disabled={!file || loading}>{loading ? "Dönüştürülüyor..." : "Dönüştür"}</PrimaryButton>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}