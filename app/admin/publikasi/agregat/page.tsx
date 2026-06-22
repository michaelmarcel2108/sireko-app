// app/admin/publikasi/agregat/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// PERUBAHAN: Alias 'Map' menjadi 'MapIcon' agar tidak bentrok dengan class Map bawaan JavaScript
import { FileText, Map as MapIcon, Building2, Users, Wallet } from 'lucide-react';

export const revalidate = 0;

export default async function AdminPublikasiAgregatPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } 
          catch (error) {}
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Tarik data keragaan untuk diagregasi berdasarkan kecamatan
  const { data: koperasiData } = await supabase
    .from('keragaan_koperasi')
    .select('kecamatan, jumlah_anggota, aset, volume_usaha, shu');

  // Proses agregasi data di Server
  const agregatMap = new Map<string, { count: number, anggota: number, aset: number, volume: number, shu: number }>();

  koperasiData?.forEach((item) => {
    const kecamatan = item.kecamatan || 'Tidak Diketahui';
    if (!agregatMap.has(kecamatan)) {
      agregatMap.set(kecamatan, { count: 0, anggota: 0, aset: 0, volume: 0, shu: 0 });
    }
    const entry = agregatMap.get(kecamatan)!;
    entry.count += 1;
    entry.anggota += (item.jumlah_anggota || 0);
    entry.aset += (item.aset || 0);
    entry.volume += (item.volume_usaha || 0);
    entry.shu += (item.shu || 0);
  });

  // Konversi map ke array dan urutkan berdasarkan jumlah koperasi terbanyak
  const agregatList = Array.from(agregatMap.entries())
    .map(([kecamatan, data]) => ({ kecamatan, ...data }))
    .sort((a, b) => b.count - a.count);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Publikasi Data Agregat
          </h1>
          <p className="text-sm text-slate-500 font-medium">Rekapitulasi total aset, anggota, dan SHU koperasi berdasarkan Kecamatan.</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {/* PERUBAHAN: Gunakan MapIcon di sini */}
              <MapIcon className="w-5 h-5 text-slate-500" /> Agregat Per Kecamatan
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Data ditarik secara real-time dari database keragaan koperasi.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70">
                <TableRow className="border-b border-slate-100">
                  <TableHead className="w-[50px] font-bold text-slate-500 text-center">No</TableHead>
                  <TableHead className="font-bold text-slate-500">Kecamatan</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Total Koperasi</TableHead>
                  <TableHead className="font-bold text-slate-500 text-right">Total Anggota</TableHead>
                  <TableHead className="font-bold text-slate-500 text-right">Total Aset</TableHead>
                  <TableHead className="font-bold text-slate-500 text-right">Total Volume Usaha</TableHead>
                  <TableHead className="font-bold text-slate-500 text-right">Total SHU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agregatList.length > 0 ? (
                  agregatList.map((item, index) => (
                    <TableRow key={index} className="hover:bg-slate-50/50 border-b border-slate-100">
                      <td className="text-center font-medium text-sm text-slate-500 py-3.5">{index + 1}</td>
                      <td className="font-bold text-sm text-slate-900 py-3.5">{item.kecamatan}</td>
                      <td className="text-center py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          <Building2 className="w-3.5 h-3.5" /> {item.count} Unit
                        </span>
                      </td>
                      <td className="text-right text-sm font-semibold text-slate-700 py-3.5 flex items-center justify-end gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {item.anggota.toLocaleString('id-ID')}
                      </td>
                      <td className="text-right text-sm font-bold text-slate-800 py-3.5">{formatRupiah(item.aset)}</td>
                      <td className="text-right text-sm font-semibold text-slate-700 py-3.5">{formatRupiah(item.volume)}</td>
                      <td className="text-right text-sm font-bold text-emerald-600 py-3.5">{formatRupiah(item.shu)}</td>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium">Data agregat tidak tersedia.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}