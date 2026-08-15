"use client";
import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";
import { decodeToDrawable, isHeic, renderWithFallback } from "@/app/lib/image";

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
  const [notice, setNotice] = useState("");

  async function handleConvert() {
    if (!file) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const fmt = FORMATS.find((f) => f.value === target)!;
      // HEIC/HEIF'i tarayıcı doğrudan çözemez; önce araya çeviri koy
      const source = await decodeToDrawable(file);
      const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
      const result = await renderWithFallback(
        bitmap.width,
        bitmap.height,
        target,
        0.92,
        (ctx, w, h) => {
          if (target === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, w, h);
          }
          ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0, w, h);
        }
      );
      bitmap.close();
      if (result.reduced) {
        setNotice(
          `Görsel bu cihaz için çok büyüktü; ${result.width}×${result.height} boyutunda kaydedildi.`
        );
      }
      const base = file.name.replace(/\.[^.]+$/, "");
      downloadBlob(result.blob, `${base}.${fmt.ext}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="Görselinizi" accent="Dönüştürün" subtitle="JPG, PNG, WebP ve HEIC/HEIF dosyalarını hızlıca çevirin." steps={["Dosya Seç", "Format Seç", "Dönüştür"]} current={loading ? 3 : file ? 2 : 1}>
      <Dropzone accept="image/*,.heic,.heif" files={file ? [file] : []} onFiles={(f) => setFile(f[0] ?? null)} />
      {file && isHeic(file) && (
        <p className="mt-3 text-sm text-violet-300">
          HEIC/HEIF algılandı; dönüştürme biraz uzun sürebilir.
        </p>
      )}
      <div className="mt-5">
        <label htmlFor="hedef-format" className="mb-2 block text-sm text-slate-400">Hedef format</label>
        <select id="hedef-format" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 outline-none focus:border-violet-400/60">
          {FORMATS.map((f) => <option key={f.value} value={f.value} className="bg-slate-900">{f.label}</option>)}
        </select>
      </div>
      <PrimaryButton onClick={handleConvert} disabled={!file || loading}>{loading ? "Dönüştürülüyor..." : "Dönüştür"}</PrimaryButton>
      {notice && <p className="mt-4 text-sm text-amber-400">{notice}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}