"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat Dashboard...</div>;

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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard SIREKO</h1>
        <Button onClick={() => router.push("/admin/laporan-baru")}>
          + Input Laporan Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Anggota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalAnggota}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Simpanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              Rp {data?.totalSimpanan?.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pinjaman Berjalan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              Rp {data?.pinjamanBerjalan?.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total SHU Akumulasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              Rp {data?.totalSHU?.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Area Grafik Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grafik Donut (Kiri) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Komposisi Simpanan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {/* 1. Tambahkan tinggi container dari 250px menjadi 300px */}
            <div className="h-[300px] w-full"> 
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, bottom: 20 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60} 
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatRupiah(value)} />
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

        {/* Grafik Area (Kanan) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren Keuangan per Periode</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    {/* Definisi Gradient Warna */}
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
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                      tickFormatter={(value) => `Rp${value / 1000000}M`} 
                    />
                    <Tooltip 
                      formatter={(value: number) => formatRupiah(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" verticalAlign="top" wrapperStyle={{ fontSize: '14px', paddingBottom: '20px' }}/>
                    
                    {/* Area Charts dengan urutan tumpukan */}
                    <Area type="monotone" dataKey="Total Simpanan" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="Pinjaman Berjalan" stroke="#0f766e" strokeWidth={2} fillOpacity={1} fill="url(#colorPinjaman)" />
                    <Area type="monotone" dataKey="SHU Bersih" stroke="#042f2e" strokeWidth={2} fillOpacity={1} fill="url(#colorSHU)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                Belum ada data riwayat laporan
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}