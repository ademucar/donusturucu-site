"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowLeftRight } from "lucide-react";
import NavLinks from "@/app/components/NavLinks";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-slate-950/95 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <ArrowLeftRight className="h-4 w-4 text-white" />
          </span>
          <span className="font-bold text-white">Çeviriyo</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="-mr-2 rounded-lg p-2 text-slate-200 active:bg-white/10"
          aria-label="Menü"
        >
          <Menu className="h-7 w-7" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col overflow-y-auto border-r border-white/10 bg-[#0a0a16] px-4 py-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold text-white">Menü</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-200 active:bg-white/10" aria-label="Kapat">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}