import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-teal-700 text-white p-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <span className="text-3xl font-bold text-teal-700">SR</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          SIREKO
        </h1>
        <p className="text-lg text-teal-100">
          Sistem Rekapan & Laporan Keuangan Koperasi. Transparan, Akurat, dan Mudah Diakses.
        </p>
        <div className="pt-4">
          <Link href="/admin">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-xl shadow-md transition-all hover:scale-105">
              Masuk ke Panel Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}