"use client";
import { useCallback, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import ResultBar from "@/app/components/ResultBar";
import { useImageProcessor } from "@/app/lib/useImageProcessor";
import { extFor, isLossy, renderImage } from "@/app/lib/image";

const FORMATS = [
  { value: "image/jpeg", label: "JPG / JPEG" },
  { value: "image/webp", label: "WebP (en iyi sıkıştırma)" },
  { value: "image/png", label: "PNG (kayıpsız)" },
];

export default function ImageCompress() {
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(80);

  const render = useCallback(
    (img: HTMLImageElement) => renderImage(img, { format, quality }),
    [format, quality]
  );

  const { file, url, imgRef, onImageLoad, selectFile, decoding, result, busy, error, download } =
    useImageProcessor(render);

  return (
    <ToolShell
      title="Görsel"
      accent="Sıkıştır"
      subtitle="Kaliteyi ayarlayarak dosya boyutunu küçültün."
      steps={["Dosya Seç", "Ayarla", "İndir"]}
      current={result ? 3 : file ? 2 : 1}
    >
      <Dropzone accept="image/*,.heic,.heif" files={file ? [file] : []} onFiles={selectFile} />

      {decoding && <p className="mt-4 text-sm text-slate-400">Görsel açılıyor...</p>}

      {url && (
        <>
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={url}
              alt="Önizleme"
              className="mx-auto max-h-[300px] w-auto"
              onLoad={onImageLoad}
            />
          </div>

          <div className="mt-5">
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

          {isLossy(format) ? (
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
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              PNG kayıpsızdır; kalite ayarı yoktur. Daha küçük dosya için WebP deneyin.
            </p>
          )}

          {file && <ResultBar originalSize={file.size} result={result} busy={busy} />}
        </>
      )}

      <PrimaryButton onClick={() => download(extFor(format), "sikistirilmis")} disabled={!result || busy}>
        {busy ? "Hazırlanıyor..." : "İndir"}
      </PrimaryButton>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}
