// app/page.tsx
import { getKeragaanData, getLegalitasData, getKesehatanData } from '@/utils/api-koperasi';
import DashboardCharts from '@/components/DashboardCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Wallet, CheckCircle2 } from 'lucide-react';

export const revalidate = 60; 

export default async function Home() {
  // Ambil ketiga data sekaligus
  const [keragaan, legalitas, kesehatan] = await Promise.all([
    getKeragaanData(),
    getLegalitasData(),
    getKesehatanData(),
  ]);

  // 1. STATISTIK KARTU (Sekarang tanpa border kiri berwarna)
  const totalKoperasi = keragaan.length;
  const totalAnggota = keragaan.reduce((sum: number, item: any) => sum + (Number(item.jumlah_anggota) || 0), 0);
  const totalAset = keragaan.reduce((sum: number, item: any) => sum + (Number(item.aset) || 0), 0);
  const koperasiAktif = legalitas.filter((item: any) => item.status_aktif === 'Aktif' || item.status_aktif === true).length;

  // 2. DATA KURVA GARIS (Aset per Kecamatan)
  const asetPerKecamatan: Record<string, number> = {};
  keragaan.forEach((item: any) => {
    const kec = item.kecamatan || 'Lainnya';
    asetPerKecamatan[kec] = (asetPerKecamatan[kec] || 0) + (Number(item.aset) || 0);
  });
  const lineChartData = Object.keys(asetPerKecamatan).map((kec) => ({
    name: kec,
    Aset: asetPerKecamatan[kec],
  }));

  // 3. DATA KURVA DONAT (Variasi 4 Predikat Kesehatan)
  let countSehat = 0;
  let countCukup = 0;
  let countKurang = 0;
  let countPengawasan = 0;

  kesehatan.forEach((item: any) => {
    const predikat = item.predikat_kesehatan;
    if (predikat === 'Sehat') countSehat++;
    else if (predikat === 'Cukup Sehat') countCukup++;
    else if (predikat === 'Kurang Sehat') countKurang++;
    else countPengawasan++;
  });

  // Menyusun data donat, membuang data yang jumlahnya 0 agar donat tetap rapi
  const donutChartData = [
    { name: 'Sehat', value: countSehat, color: '#10b981' },           // Hijau
    { name: 'Cukup Sehat', value: countCukup, color: '#3b82f6' },     // Biru
    { name: 'Kurang Sehat', value: countKurang, color: '#f59e0b' },   // Kuning/Oranye
    { name: 'Dalam Pengawasan', value: countPengawasan, color: '#ef4444' }, // Merah
  ].filter(data => data.value > 0);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Utama</h1>
        <p className="text-muted-foreground mt-1">Ringkasan eksekutif data koperasi Kabupaten Buleleng.</p>
      </div>

      {/* Baris Kartu - Polos tanpa border kiri berwarna */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Koperasi</CardTitle>
            <Building2 className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKoperasi}</div>
            <p className="text-xs text-muted-foreground mt-1">Unit terdaftar di sistem</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Koperasi Aktif</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{koperasiAktif}</div>
            <p className="text-xs text-muted-foreground mt-1">Sesuai data legalitas</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Anggota</CardTitle>
            <Users className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnggota.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Orang tergabung</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Aset Keseluruhan</CardTitle>
            <Wallet className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={formatRupiah(totalAset)}>
              {formatRupiah(totalAset)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Akumulasi seluruh kecamatan</p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts lineData={lineChartData} donutData={donutChartData} />

    </div>
  );
}