import { formatBytes } from "@/app/lib/format";
import type { RenderResult } from "@/app/lib/image";

type Props = {
  originalSize: number;
  result: RenderResult | null;
  busy: boolean;
};

export default function ResultBar({ originalSize, result, busy }: Props) {
  const change = result ? 1 - result.blob.size / originalSize : 0;

  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
      {busy || !result ? (
        <p className="text-slate-400">Hesaplanıyor...</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-400">
            {formatBytes(originalSize)} →{" "}
            <span className="text-slate-200">{formatBytes(result.blob.size)}</span>
            <span className="ml-2 text-slate-500">
              {result.width}×{result.height}
            </span>
          </span>
          {(() => {
            const pct = Math.round(change * 100);
            if (pct === 0) return <span className="text-slate-500">boyut aynı</span>;
            return (
              <span className={pct > 0 ? "font-medium text-emerald-400" : "text-amber-400"}>
                {pct > 0 ? `%${pct} küçüldü` : `%${Math.abs(pct)} büyüdü`}
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
}
