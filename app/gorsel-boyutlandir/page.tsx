"use client";
import { useCallback, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import ResultBar from "@/app/components/ResultBar";
import { useImageProcessor } from "@/app/lib/useImageProcessor";
import { extFor, outputTypeFor, renderImage } from "@/app/lib/image";

const PRESETS = [480, 720, 1080, 1920];

export default function ImageResize() {
  const [maxWidth, setMaxWidth] = useState("");
  const [maxHeight, setMaxHeight] = useState("");
  const [format, setFormat] = useState<string | null>(null);

  const render = useCallback(
    (img: HTMLImageElement) =>
      renderImage(img, {
        maxWidth: parseInt(maxWidth, 10) || null,
        maxHeight: parseInt(maxHeight, 10) || null,
        format: format!,
      }),
    [maxWidth, maxHeight, format]
  );

  const { file, url, imgRef, onImageLoad, selectFile, decoding, result, busy, error, download } =
    useImageProcessor(render);

  function handleFiles(files: File[]) {
    setMaxWidth("");
    setMaxHeight("");
    setFormat(files[0] ? outputTypeFor(files[0]) : null);
    selectFile(files);
  }

  const onlyDigits = (v: string) => v.replace(/[^\d]/g, "");

  return (
    <ToolShell
      title="Görsel"
      accent="Boyutlandır"
      subtitle="En-boy oranını koruyarak küçültün. Format korunur."
      steps={["Dosya Seç", "Ölçü Ver", "İndir"]}
      current={maxWidth || maxHeight ? 3 : file ? 2 : 1}
    >
      <Dropzone accept="image/*,.heic,.heif" files={file ? [file] : []} onFiles={handleFiles} />

      {decoding && <p className="mt-4 text-sm text-slate-400">Görsel açılıyor...</p>}

      {url && (
        <>
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={url}
              alt="Önizleme"
              className="mx-auto max-h-[clamp(120px,34dvh,320px)] w-auto"
              onLoad={onImageLoad}
            />
          </div>

          <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-4">
            <div>
              <label htmlFor="genislik" className="mb-2 block text-sm text-slate-400">Genişlik (px)</label>
              <input
                id="genislik"
                value={maxWidth}
                onChange={(e) => setMaxWidth(onlyDigits(e.target.value))}
                inputMode="numeric"
                placeholder="Orijinal"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 outline-none focus:border-violet-400/60"
              />
            </div>
            <div>
              <label htmlFor="yukseklik" className="mb-2 block text-sm text-slate-400">Yükseklik (px)</label>
              <input
                id="yukseklik"
                value={maxHeight}
                onChange={(e) => setMaxHeight(onlyDigits(e.target.value))}
                inputMode="numeric"
                placeholder="Orijinal"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 outline-none focus:border-violet-400/60"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setMaxWidth(String(p));
                  setMaxHeight("");
                }}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
              >
                {p}px genişlik
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Sadece birini doldurabilirsiniz; oran her zaman korunur ve görsel büyütülmez.
          </p>

          {file && <ResultBar originalSize={file.size} result={result} busy={busy} />}
        </>
      )}

      <PrimaryButton
        onClick={() => format && download(extFor(format), "boyutlandirilmis")}
        disabled={!result || busy}
      >
        {busy ? "Hazırlanıyor..." : "İndir"}
      </PrimaryButton>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}
