"use client";
import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import Dropzone from "@/app/components/Dropzone";
import PrimaryButton from "@/app/components/PrimaryButton";
import { downloadBlob } from "@/app/lib/download";

export default function PdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState("keep");
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    if (!file) { setError("PDF seçin."); return; }
    if (!pages.trim()) { setError("Sayfa numaralarını girin (örn: 1,3,5-7)."); return; }
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("mode", mode);
      form.append("pages", pages);
      const res = await fetch("/api/convert/pdf-pages", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "İşlem başarısız.");
      }
      const base = file.name.replace(/\.[^.]+$/, "");
      downloadBlob(await res.blob(), `${base}-duzenlenmis.pdf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell title="PDF" accent="Sayfa Seç / Sil" subtitle="Belirttiğiniz sayfaları tutun ya da silin." steps={["Dosya Seç", "Ayarla & Uygula"]} current={file ? 2 : 1}>
      <Dropzone accept="application/pdf" files={file ? [file] : []} onFiles={(f) => setFile(f[0] ?? null)} />
      <div className="mt-5 space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setMode("keep")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === "keep" ? "bg-violet-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>Sadece bunları tut</button>
          <button onClick={() => setMode("remove")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === "remove" ? "bg-violet-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>Bunları sil</button>
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-400">Sayfalar</label>
          <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="örn: 1,3,5-7"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-slate-200 outline-none focus:border-violet-400/60" />
        </div>
      </div>
      <PrimaryButton onClick={handleRun} disabled={!file || loading}>{loading ? "Uygulanıyor..." : "Uygula"}</PrimaryButton>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </ToolShell>
  );
}