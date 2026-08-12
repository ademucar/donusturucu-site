"use client";
import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

type Props = {
  accept: string;
  multiple?: boolean;
  files: File[];
  onFiles: (files: File[]) => void;
};

export default function Dropzone({ accept, multiple, files, onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const dropped = Array.from(e.dataTransfer.files);
        onFiles(multiple ? dropped : dropped.slice(0, 1));
      }}
      className={`group cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
        drag
          ? "border-violet-400 bg-violet-500/10"
          : "border-white/15 hover:border-violet-400/60 hover:bg-white/[0.03]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/80 to-indigo-600/80 shadow-lg shadow-violet-600/30">
        <UploadCloud className="h-7 w-7 text-white" />
      </div>
      {files.length === 0 ? (
        <>
          <p className="font-medium text-slate-200">Dosyalarınızı buraya sürükleyin veya seçin</p>
          <p className="mt-1 text-sm text-slate-500">{multiple ? "Bir veya birden fazla dosya" : "Tek dosya"}</p>
        </>
      ) : (
        <div className="text-sm">
          <p className="font-medium text-violet-300">{files.length} dosya seçildi</p>
          <p className="mt-1 truncate text-slate-500">{files.map((f) => f.name).join(", ")}</p>
        </div>
      )}
    </div>
  );
}