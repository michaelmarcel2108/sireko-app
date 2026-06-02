import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIREKO - Sistem Laporan Keuangan",
  description: "Dashboard Koperasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Tambahkan suppressHydrationWarning di sini
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="min-h-screen bg-slate-50">
          {children}
        </main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}