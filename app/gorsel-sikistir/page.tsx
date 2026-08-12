"use client";
import { useCallback, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import ResultBar from "@/app/components/ResultBar";
import { useImageProcessor } from "@/app/lib/useImageProcessor";
import { extFor, isLossy, outputTypeFor, renderImage } from "@/app/lib/image";

export default function ImageCompress() {
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<string | null>(null);

  const render = useCallback(
    (img: HTMLImageElement) => renderImage(img, { format: format!, quality }),
    [format, quality]
  );

  const { file, url, imgRef, onImageLoad, selectFile, decoding, result, busy, error, download } =
    useImageProcessor(render);

  function handleFiles(files: File[]) {
    setFormat(files[0] ? outputTypeFor(files[0]) : null);
    selectFile(files);
  }

  const lossy = format ? isLossy(format) : true;

  return (
    <ToolShell
      title="Görsel"
      accent="Sıkıştır"
      subtitle="Kaliteyi ayarlayarak dosya boyutunu küçültün. Format korunur."
      steps={["Dosya Seç", "Ayarla", "İndir"]}
      current={result ? 3 : file ? 2 : 1}
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
              className="mx-auto max-h-[300px] w-auto"
              onLoad={onImageLoad}
            />
          </div>

          {lossy ? (
            <div className="mt-5">
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
            <p className="mt-5 text-sm text-amber-400">
              PNG kayıpsız bir formattır; kalite düşürülerek küçültülemez. Boyutu azaltmak için
              Boyutlandır aracını kullanabilir ya da görseli JPG/WebP olarak Görsel Dönüştürücü
              üzerinden kaydedebilirsiniz.
            </p>
          )}

          {file && <ResultBar originalSize={file.size} result={result} busy={busy} />}
        </>
      )}

      <PrimaryButton
        onClick={() => format && download(extFor(format), "sikistirilmis")}
        disabled={!result || busy}
      >
        {busy ? "Hazırlanıyor..." : "İndir"}
      </PrimaryButton>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}
