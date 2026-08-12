"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { decodeToDrawable, type RenderResult } from "@/app/lib/image";
import { downloadBlob } from "@/app/lib/download";

type RenderFn = (img: HTMLImageElement) => Promise<RenderResult | null>;

/**
 * Görsel araçlarının ortak iskeleti: dosya seçimi, HEIC çözümü, önizleme URL'i
 * ve ayar değiştikçe çıktıyı yeniden üretme.
 */
export function useImageProcessor(render: RenderFn) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [decoding, setDecoding] = useState(false);
  const [loadedAt, setLoadedAt] = useState(0);
  const [result, setResult] = useState<RenderResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const urlRef = useRef("");

  const selectFile = useCallback(async (files: File[]) => {
    const next = files[0] ?? null;
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = "";
    }
    setResult(null);
    setError("");
    setUrl("");
    setFile(next);
    if (!next) return;
    setDecoding(true);
    try {
      // HEIC ise önce tarayıcının çizebileceği bir formata çevir
      const drawable = await decodeToDrawable(next);
      const u = URL.createObjectURL(drawable);
      urlRef.current = u;
      setUrl(u);
    } catch {
      setError("Görsel açılamadı. Dosya bozuk veya desteklenmiyor olabilir.");
      setFile(null);
    } finally {
      setDecoding(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  // Ayarlar (render) veya görsel değiştikçe çıktıyı yeniden üret
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      const img = imgRef.current;
      if (!img || !img.naturalWidth) return;
      setBusy(true);
      try {
        const r = await render(img);
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
  }, [url, render, loadedAt]);

  const onImageLoad = useCallback(() => setLoadedAt(Date.now()), []);

  const download = useCallback(
    (ext: string, suffix: string) => {
      if (!result || !file) return;
      const base = file.name.replace(/\.[^.]+$/, "");
      downloadBlob(result.blob, `${base}-${suffix}.${ext}`);
    },
    [result, file]
  );

  return {
    file,
    url,
    imgRef,
    onImageLoad,
    selectFile,
    decoding,
    result,
    busy,
    error,
    download,
  };
}
