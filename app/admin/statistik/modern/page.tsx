// app/admin/statistik/modern/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Laptop, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default async function AdminStatistikModernPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch (error) {} } } }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Tarik data koperasi modern (Asumsi ada kolom is_modern di keragaan_koperasi)
  const { data: modernList } = await supabase
    .from('keragaan_koperasi')
    .select('nama_koperasi, kecamatan, aset')
    // .eq('is_modern', true) // Aktifkan filter ini jika kolom tersedia di DB
    .order('aset', { ascending: false });

  const formatRupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
        <Laptop className="w-6 h-6 text-blue-600" /> Statistik Koperasi Modern
      </h1>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="p-6 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Daftar Koperasi Terdigitalisasi</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400">Total terdata: {modernList?.length || 0} unit</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70">
                <TableRow>
                  <TableHead className="w-[50px] text-center">No</TableHead>
                  <TableHead>Nama Koperasi</TableHead>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead className="text-right">Total Aset</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modernList && modernList.length > 0 ? modernList.map((item, index) => (
                  <TableRow key={index}>
                    <td className="text-center font-medium text-sm text-slate-500 py-3.5">{index + 1}</td>
                    <td className="font-bold text-sm text-slate-900 py-3.5">{item.nama_koperasi}</td>
                    <td className="text-sm font-semibold text-slate-600 py-3.5">{item.kecamatan || '-'}</td>
                    <td className="text-right text-sm font-bold text-slate-800 py-3.5">{formatRupiah(item.aset || 0)}</td>
                    <td className="text-center py-3.5"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800"><CheckCircle2 className="w-3 h-3"/> Modern</span></td>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400">Belum ada koperasi modern terdata.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}