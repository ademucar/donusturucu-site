"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import NavLinks from "@/app/components/NavLinks";

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-white/5 bg-slate-950/60 px-4 py-6 md:flex">
      <Link href="/" className="flex items-center gap-3 px-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-600/30">
          <ArrowLeftRight className="h-5 w-5 text-white" />
        </span>
        <span>
          <span className="block text-lg font-bold leading-tight text-white">Çeviriyo</span>
          <span className="block text-xs text-slate-400">PDF ve Resim Aracı</span>
        </span>
      </Link>
      <NavLinks pathname={pathname} />
    </aside>
  );
}