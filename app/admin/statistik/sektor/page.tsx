// app/admin/statistik/sektor/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Building2 } from 'lucide-react';

export const revalidate = 0;

export default async function AdminStatistikSektorPage() {
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

  // Tarik data keragaan untuk diagregasi berdasarkan jenis/sektor usaha
  const { data: koperasiData } = await supabase
    .from('keragaan_koperasi')
    .select('jenis_koperasi'); // Asumsi kolom jenis usaha/sektor bernama 'jenis_koperasi'

  // Proses agregasi data di Server
  const sektorMap = new Map<string, number>();

  koperasiData?.forEach((item) => {
    const sektor = item.jenis_koperasi || 'Tidak Diketahui / Lainnya';
    if (!sektorMap.has(sektor)) {
      sektorMap.set(sektor, 0);
    }
    sektorMap.set(sektor, sektorMap.get(sektor)! + 1);
  });

  // Konversi map ke array dan urutkan berdasarkan jumlah terbanyak
  const sektorList = Array.from(sektorMap.entries())
    .map(([sektor, count]) => ({ sektor, count }))
    .sort((a, b) => b.count - a.count);

  const totalKoperasi = koperasiData?.length || 0;

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-blue-600" /> Statistik Sektor Usaha
          </h1>
          <p className="text-sm text-slate-500 font-medium">Pemetaan jumlah koperasi berdasarkan jenis dan sektor usaha.</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900">Agregasi per Sektor</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Total populasi: <span className="text-slate-700 font-bold">{totalKoperasi}</span> koperasi aktif
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70">
                <TableRow className="border-b border-slate-100">
                  <TableHead className="w-[50px] font-bold text-slate-500 text-center">Peringkat</TableHead>
                  <TableHead className="font-bold text-slate-500">Jenis / Sektor Usaha</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Jumlah Unit</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sektorList.length > 0 ? (
                  sektorList.map((item, index) => {
                    const percentage = totalKoperasi > 0 ? ((item.count / totalKoperasi) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <TableRow key={index} className="hover:bg-slate-50/50 border-b border-slate-100">
                        <td className="text-center font-bold text-sm text-slate-400 py-3.5">#{index + 1}</td>
                        <td className="font-bold text-sm text-slate-900 py-3.5 uppercase">{item.sektor}</td>
                        <td className="text-center py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            <Building2 className="w-3.5 h-3.5" /> {item.count} Koperasi
                          </span>
                        </td>
                        <td className="text-center text-sm font-semibold text-slate-600 py-3.5">
                          {percentage}%
                        </td>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-slate-400 font-medium">Data sektor usaha tidak tersedia.</TableCell>
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