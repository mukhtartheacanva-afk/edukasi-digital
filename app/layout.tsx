import type { Metadata, Viewport } from "next"; // Tambahkan Viewport di sini
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata untuk SEO & Judul Tab
export const metadata: Metadata = {
  title: "SI-DUGI | Edukasi Digital",
  description: "Platform edukasi digital ekosistem hutan",
};

// FIX UTAMA: Cara Next.js terbaru mengontrol skala layar HP
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Mencegah user zoom-out yang bikin layout berantakan
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id"> 
      {/* PENTING: Hapus tag <meta> manual dari sini karena sudah dihandle export const viewport di atas */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}