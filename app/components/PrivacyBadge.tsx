import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function PrivacyBadge() {
  return (
    <div className="mx-auto mt-6 flex max-w-2xl items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
      <p className="text-sm leading-relaxed text-slate-300">
        <strong className="text-white">Dosyalarınız cihazınızdan çıkmaz.</strong> Tüm dönüştürme
        işlemleri tarayıcınızda yapılır; hiçbir dosya sunucuya yüklenmez.{" "}
        <Link href="/gizlilik" className="text-emerald-300 underline-offset-2 hover:underline">
          Nasıl çalışıyor?
        </Link>
      </p>
    </div>
  );
}
