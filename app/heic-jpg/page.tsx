"use client";
import { useState } from "react";
import JSZip from "jszip";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";

// iPhone HEIC dosyaları bazı tarayıcılarda boş MIME tipiyle gelir; uzantıya da bakıyoruz.
const HEIC_RE = /\.(heic|heif)$/i;

export default function HeicToJpg() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function handleConvert() {
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    setProgress("");
    try {
      const heic2any = (await import("heic2any")).default;
      const out: { name: string; blob: Blob }[] = [];
      const failed: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(`${i + 1} / ${files.length} dönüştürülüyor...`);
        const base = file.name.replace(/\.[^.]+$/, "");
        try {
          const converted = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: quality / 100,
          });
          // Çok kareli HEIC'lerde dizi dönebiliyor
          const blobs = Array.isArray(converted) ? converted : [converted];
          blobs.forEach((b, k) => {
            const suffix = blobs.length > 1 ? `-${k + 1}` : "";
            out.push({ name: `${base}${suffix}.jpg`, blob: b });
          });
        } catch {
          failed.push(file.name);
        }
      }

      if (out.length === 0) {
        throw new Error("Hiçbir dosya dönüştürülemedi. Geçerli bir HEIC dosyası seçtiğinizden emin olun.");
      }

      if (out.length === 1) {
        downloadBlob(out[0].blob, out[0].name);
      } else {
        setProgress("ZIP hazırlanıyor...");
        const zip = new JSZip();
        out.forEach((o) => zip.file(o.name, o.blob));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, "heic-donusturuldu.zip");
      }

      if (failed.length > 0) {
        setError(`Şu dosyalar dönüştürülemedi: ${failed.join(", ")}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  const nonHeic = files.filter((f) => !HEIC_RE.test(f.name) && !/heic|heif/i.test(f.type));

  return (
    <ToolShell
      title="HEIC'ten"
      accent="JPG'ye"
      subtitle="iPhone fotoğraflarınızı her yerde açılan JPG'ye çevirin."
      steps={["Dosya Seç", "Dönüştür"]}
      current={files.length ? 2 : 1}
    >
      <Dropzone
        accept=".heic,.heif,image/heic,image/heif"
        multiple
        files={files}
        onFiles={setFiles}
      />

      {nonHeic.length > 0 && (
        <p className="mt-3 text-sm text-amber-400">
          {nonHeic.length} dosya HEIC/HEIF görünmüyor; atlanabilir.
        </p>
      )}

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

      <PrimaryButton onClick={handleConvert} disabled={files.length === 0 || loading}>
        {loading ? progress || "Dönüştürülüyor..." : "JPG'ye Çevir"}
      </PrimaryButton>
      {files.length > 1 && !loading && (
        <p className="mt-3 text-center text-xs text-slate-500">
          Birden fazla dosya ZIP olarak inecek.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}
