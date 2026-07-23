type Props = {
  title: string;
  accent?: string;
  subtitle: string;
  steps?: string[];
  current?: number;
  children: React.ReactNode;
};

export default function ToolShell({ title, accent, subtitle, steps, current = 1, children }: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title} {accent && <span className="text-gradient">{accent}</span>}
        </h1>
        <p className="mt-3 text-slate-400">{subtitle}</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/40 sm:p-8">
        {steps && (
          <div className="mb-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
            {steps.map((s, i) => {
              const done = i + 1 <= current;
              return (
                <div key={s} className="flex items-center gap-2">
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition ${done ? "bg-violet-600 text-white" : "bg-white/10 text-slate-400"}`}>{i + 1}</span>
                  <span className={`text-sm ${done ? "text-slate-200" : "text-slate-500"}`}>{s}</span>
                  {i < steps.length - 1 && <span className="mx-1 hidden h-px w-6 bg-white/15 sm:block" />}
                </div>
              );
            })}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}