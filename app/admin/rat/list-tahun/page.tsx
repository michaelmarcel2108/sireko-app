// app/admin/rat/list-tahun/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { List, CheckCircle2, Clock } from 'lucide-react';

export const revalidate = 0;

export default async function AdminRatListTahunPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch (error) {} } } }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: ratList } = await supabase.from('rat_tahun').select('*, keragaan_koperasi(nama_koperasi)').order('tahun_buku', { ascending: false });

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
        <List className="w-6 h-6 text-blue-600" /> List Arsip RAT Tahunan
      </h1>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="p-6 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Rekapitulasi Semua RAT</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400">Total terdata: {ratList?.length || 0} laporan</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="text-center w-[50px]">No</TableHead>
                <TableHead>Tahun Buku</TableHead>
                <TableHead>ID Koperasi (User ID)</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratList && ratList.length > 0 ? ratList.map((item, index) => (
                <TableRow key={index}>
                  <td className="text-center font-medium text-sm text-slate-500 py-3.5">{index + 1}</td>
                  <td className="font-extrabold text-sm text-slate-900 py-3.5">{item.tahun_buku || '-'}</td>
                  <td className="text-sm font-semibold text-slate-600 py-3.5">{item.user_id || '-'}</td>
                  <td className="text-center py-3.5">
                    {item.status_laporan?.toLowerCase() === 'diterima' ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3"/> Diterima</span> : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800"><Clock className="w-3 h-3"/> Pending</span>}
                  </td>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="text-center py-12 text-slate-400">Belum ada arsip RAT Tahunan.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}