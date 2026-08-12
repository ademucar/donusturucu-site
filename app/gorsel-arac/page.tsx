"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";
import { formatBytes } from "@/app/lib/format";

const FORMATS = [
  { value: "image/jpeg", label: "JPG / JPEG", ext: "jpg", lossy: true },
  { value: "image/webp", label: "WebP", ext: "webp", lossy: true },
  { value: "image/png", label: "PNG", ext: "png", lossy: false },
];

type Result = { blob: Blob; width: number; height: number };

export default function ImageTool() {
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);

  const fmt = FORMATS.find((f) => f.value === format)!;

  // Önizleme URL'ini dosya seçilirken kur; ayrılırken serbest bırak
  function handleFiles(f: File[]) {
    const next = f[0] ?? null;
    if (image) URL.revokeObjectURL(image.url);
    setImage(next ? { file: next, url: URL.createObjectURL(next) } : null);
    setCrop(undefined);
    setCompletedCrop(null);
    setResult(null);
  }

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url);
    };
  }, [image]);

  const render = useCallback(async (): Promise<Result | null> => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return null;

    // ReactCrop piksel değerleri ekrandaki boyuta göre; gerçek boyuta ölçekle
    const sx = img.naturalWidth / img.width;
    const sy = img.naturalHeight / img.height;
    let cx = 0;
    let cy = 0;
    let cw = img.naturalWidth;
    let ch = img.naturalHeight;
    if (completedCrop && completedCrop.width > 1 && completedCrop.height > 1) {
      cx = completedCrop.x * sx;
      cy = completedCrop.y * sy;
      cw = completedCrop.width * sx;
      ch = completedCrop.height * sy;
    }

    let outW = cw;
    let outH = ch;
    const mw = parseInt(maxWidth, 10);
    if (Number.isFinite(mw) && mw > 0 && cw > mw) {
      outW = mw;
      outH = (ch * mw) / cw;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(outW));
    canvas.height = Math.max(1, Math.round(outH));
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, cx, cy, cw, ch, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, format, fmt.lossy ? quality / 100 : undefined)
    );
    if (!blob) return null;
    return { blob, width: canvas.width, height: canvas.height };
  }, [completedCrop, format, quality, maxWidth, fmt.lossy]);

  // Ayarlar değiştikçe çıktıyı yeniden üret (boyutu canlı göstermek için)
  const url = image?.url ?? "";
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      setBusy(true);
      try {
        const r = await render();
        if (!cancelled) {
          setResult(r);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Görsel işlenemedi.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [url, render]);

  function handleDownload() {
    if (!result || !image) return;
    const base = image.file.name.replace(/\.[^.]+$/, "");
    downloadBlob(result.blob, `${base}-duzenlenmis.${fmt.ext}`);
  }

  const saving = image && result ? 1 - result.blob.size / image.file.size : 0;

  return (
    <ToolShell
      title="Görsel"
      accent="Aracı"
      subtitle="Kırpın, boyutlandırın ve sıkıştırın. Her şey tarayıcınızda kalır."
      steps={["Dosya Seç", "Düzenle", "İndir"]}
      current={result ? 3 : image ? 2 : 1}
    >
      <Dropzone accept="image/*" files={image ? [image.file] : []} onFiles={handleFiles} />

      {image && (
        <>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm text-slate-400">Kırpma alanı</label>
              {completedCrop && (
                <button
                  onClick={() => {
                    setCrop(undefined);
                    setCompletedCrop(null);
                  }}
                  className="text-xs text-violet-300 hover:text-violet-200"
                >
                  Kırpmayı sıfırla
                </button>
              )}
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={image.url}
                  alt="Önizleme"
                  className="mx-auto max-h-[380px] w-auto"
                  onLoad={() => setResult(null)}
                />
              </ReactCrop>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Sürükleyerek bir alan seçin; seçmezseniz görselin tamamı kullanılır.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-400">Hedef format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 outline-none focus:border-violet-400/60"
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value} className="bg-slate-900">
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Maksimum genişlik (px)
              </label>
              <input
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric"
                placeholder="Orijinal"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 outline-none focus:border-violet-400/60"
              />
            </div>
          </div>

          {fmt.lossy && (
            <div className="mt-4">
              <label className="mb-2 flex items-center justify-between text-sm text-slate-400">
                <span>Kalite</span>
                <span className="text-slate-300">%{quality}</span>
              </label>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          )}

          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            {busy && <p className="text-slate-400">Hesaplanıyor...</p>}
            {!busy && result && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-400">
                  {formatBytes(image.file.size)} → <span className="text-slate-200">{formatBytes(result.blob.size)}</span>
                  <span className="ml-2 text-slate-500">
                    ({result.width}×{result.height})
                  </span>
                </span>
                <span className={saving > 0 ? "font-medium text-emerald-400" : "text-amber-400"}>
                  {saving > 0
                    ? `%${Math.round(saving * 100)} küçüldü`
                    : `%${Math.abs(Math.round(saving * 100))} büyüdü`}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <PrimaryButton onClick={handleDownload} disabled={!result || busy}>
        {busy ? "Hazırlanıyor..." : "İndir"}
      </PrimaryButton>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}
