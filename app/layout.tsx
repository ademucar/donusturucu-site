import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/app/components/Sidebar";
import MobileNav from "@/app/components/MobileNav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Çeviriyo",
  description: "Hızlı, kolay ve güvenli dönüştürme.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="flex-1">
            <MobileNav />
            <main className="px-[clamp(0.75rem,3.5vw,2.5rem)] py-[clamp(1rem,4vh,2.5rem)]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}