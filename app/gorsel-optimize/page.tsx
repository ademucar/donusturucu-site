"use client";
import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";

export default function ImageOptimize() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("quality", String(quality));
      if (width) form.append("width", width);
      if (height) form.append("height", height);
      const res = await fetch("/api/convert/image-optimize", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "İşlem başarısız.");
      }
      const base = file.name.replace(/\.[^.]+$/, "");
      const ext = (file.name.match(/\.([^.]+)$/)?.[1] || "jpg").toLowerCase();
      downloadBlob(await res.blob(), `${base}-optimize.${ext === "jpeg" ? "jpg" : ext}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      title="Görsel"
      accent="Sıkıştır & Boyutlandır"
      subtitle="Kaliteyi düşürerek boyutu küçültün; isterseniz en/boy sınırı verin."
      steps={["Dosya Seç", "Ayarla & İşle"]}
      current={file ? 2 : 1}
    >
      <Dropzone accept="image/*" files={file ? [file] : []} onFiles={(f) => setFile(f[0] ?? null)} />

      <div className="mt-5 space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <label className="text-slate-400">Kalite</label>
            <span className="font-medium text-violet-300">{quality}%</span>
          </div>
          <input
            type="range" min={10} max={100} value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm text-slate-400">Maks. genişlik (px)</label>
            <input
              type="number" placeholder="opsiyonel" value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 outline-none focus:border-violet-400/60"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-400">Maks. yükseklik (px)</label>
            <input
              type="number" placeholder="opsiyonel" value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 outline-none focus:border-violet-400/60"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">En/boy boş bırakılırsa orijinal boyut korunur, sadece sıkıştırılır. Oran her zaman korunur.</p>
      </div>

      <PrimaryButton onClick={handleRun} disabled={!file || loading}>
        {loading ? "İşleniyor..." : "İşle ve İndir"}
      </PrimaryButton>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}