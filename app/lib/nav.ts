import {
  Image as ImageIcon, FileImage, FileText, Files, Scissors,
  Crop, Scaling, Shrink,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const groups: NavGroup[] = [
  {
    label: "Görsel",
    items: [
      { href: "/", label: "Görsel Dönüştürücü", icon: ImageIcon },
      { href: "/gorsel-kirp", label: "Kırp", icon: Crop },
      { href: "/gorsel-boyutlandir", label: "Boyutlandır", icon: Scaling },
      { href: "/gorsel-sikistir", label: "Sıkıştır", icon: Shrink },
      { href: "/gorsel-pdf", label: "Görsel → PDF", icon: FileImage },
    ],
  },
  {
    label: "PDF",
    items: [
      { href: "/pdf-gorsel", label: "PDF → Görsel", icon: FileText },
      { href: "/pdf-birlestir", label: "PDF Birleştir", icon: Files },
      { href: "/pdf-sayfa", label: "Sayfa Seç / Sil", icon: Scissors },
    ],
  },
];