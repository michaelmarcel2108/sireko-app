// components/KoperasiCharts.tsx
"use client";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';

interface KoperasiChartsProps {
  financialHistory: { tahun: string; Aset: number; VolumeUsaha: number; SHU: number }[];
  healthHistory: { tahun: string; Skor: number; Predikat: string }[];
}

export default function KoperasiCharts({ financialHistory, healthHistory }: KoperasiChartsProps) {
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* 1. KURVA PERKEMBANGAN KEUANGAN */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Grafik Perkembangan Keuangan</h3>
        <div className="h-[280px] w-full">
          {financialHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialHistory} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="tahun" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `Rp ${v / 1000000}Jt`} tick={{ fontSize: 11 }} width={75} />
                <Tooltip formatter={(value: any) => [formatRupiah(Number(value)), ""]} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {/* Penambahan dot={{ r: 4 }} agar titik datanya membulat dan jelas */}
                <Line type="monotone" dataKey="Aset" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} name="Total Aset" />
                <Line type="monotone" dataKey="VolumeUsaha" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} name="Vol Usaha" />
                <Line type="monotone" dataKey="SHU" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} name="SHU" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">Belum ada data keuangan.</div>
          )}
        </div>
      </div>

      {/* 2. KURVA TREN SKOR KESEHATAN */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Grafik Tren Skor Kesehatan</h3>
        <div className="h-[280px] w-full">
          {healthHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthHistory} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="tahun" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={35} />
                <Tooltip formatter={(value: any, name: any, props: any) => [`Skor: ${value} (${props.payload.Predikat})`, "Kesehatan"]} />
                <Bar dataKey="Skor" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {healthHistory.map((entry, index) => {
                    let color = "#10b981";
                    if (entry.Predikat === "Cukup Sehat") color = "#3b82f6";
                    if (entry.Predikat === "Kurang Sehat") color = "#f59e0b";
                    if (entry.Predikat === "Dalam Pengawasan") color = "#ef4444";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">Belum ada riwayat penilaian.</div>
          )}
        </div>
      </div>

    </div>
  );
}