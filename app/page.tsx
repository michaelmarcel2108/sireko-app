"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

export default function UserDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mengambil data ringkasan dari API yang sudah ada
  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xl font-semibold text-teal-700">Memuat Data Transparansi SIREKO...</div>
      </div>
    );
  }

  // Format data untuk grafik
  const chartData = data?.riwayat?.slice().reverse().map((item: any) => ({
    name: `${item.periodes.bulan.substring(0, 3)} ${item.periodes.tahun}`,
    "Total Simpanan": Number(item.total_simpanan),
    "Pinjaman Berjalan": Number(item.pinjaman_berjalan),
    "SHU Bersih": Number(item.shu_bersih),
  })) || [];

  const pieData = [
    { name: "Simpanan Pokok", value: Number(data?.komposisiSimpanan?.pokok || 0) },
    { name: "Simpanan Wajib", value: Number(data?.komposisiSimpanan?.wajib || 0) },
    { name: "Simpanan Sukarela", value: Number(data?.komposisiSimpanan?.sukarela || 0) },
  ];
  
  const PIE_COLORS = ["#0f766e", "#14b8a6", "#34d399"];

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Public Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-teal-700 text-white p-6 md:p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center text-center md:text-left space-y-4 md:space-y-0 md:space-x-6 mb-6 md:mb-0">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner">
              <span className="text-3xl font-bold text-teal-700">SR</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Portal Transparansi SIREKO</h1>
              <p className="text-teal-100 text-base sm:text-lg">
                Sistem Rekapan & Laporan Keuangan Koperasi
              </p>
            </div>
          </div>
          <Link href="/admin">
            <Button size="lg" variant="secondary" className="bg-white text-teal-800 hover:bg-teal-50 font-bold shadow-md transition-transform hover:scale-105">
              Login Admin
            </Button>
          </Link>
        </div>

        {/* Kartu Ringkasan Data Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Total Anggota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-gray-800">{data?.totalAnggota}</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Total Simpanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">
                {formatRupiah(data?.totalSimpanan || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Pinjaman Berjalan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">
                {formatRupiah(data?.pinjamanBerjalan || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Total SHU Terkumpul
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">
                {formatRupiah(data?.totalSHU || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualisasi Grafik */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Grafik Donut Komposisi */}
          <Card className="lg:col-span-1 border-none shadow-md">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-lg font-bold text-gray-800">Komposisi Simpanan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="h-[320px] w-full"> 
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 10, bottom: 20 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={70} 
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatRupiah(Number(value) || 0)} />
                    <Legend 
                      iconType="circle" 
                      layout="vertical" 
                      verticalAlign="bottom" 
                      wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Grafik Area Tren Keuangan */}
          <Card className="lg:col-span-2 border-none shadow-md">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-lg font-bold text-gray-800">Tren Keuangan Koperasi</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {chartData.length > 0 ? (
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPinjaman" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSHU" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#042f2e" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#042f2e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13 }} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 13 }} 
                        tickFormatter={(value) => `Rp${value / 1000000}M`} 
                      />
                      <Tooltip 
                        formatter={(value: any) => formatRupiah(Number(value) || 0)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" verticalAlign="top" wrapperStyle={{ fontSize: '14px', paddingBottom: '20px' }}/>
                      
                      <Area type="monotone" dataKey="Total Simpanan" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                      <Area type="monotone" dataKey="Pinjaman Berjalan" stroke="#0f766e" strokeWidth={3} fillOpacity={1} fill="url(#colorPinjaman)" />
                      <Area type="monotone" dataKey="SHU Bersih" stroke="#042f2e" strokeWidth={3} fillOpacity={1} fill="url(#colorSHU)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl bg-gray-50/50">
                  Belum ada data riwayat laporan keuangan.
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}