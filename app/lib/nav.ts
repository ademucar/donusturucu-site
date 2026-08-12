import {
  Image as ImageIcon, FileImage, FileText, Files, Scissors,
  Crop, Smartphone,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const groups: NavGroup[] = [
  {
    label: "Görsel",
    items: [
      { href: "/", label: "Görsel Dönüştürücü", icon: ImageIcon },
      { href: "/gorsel-arac", label: "Kırp & Sıkıştır", icon: Crop },
      { href: "/heic-jpg", label: "HEIC → JPG", icon: Smartphone },
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