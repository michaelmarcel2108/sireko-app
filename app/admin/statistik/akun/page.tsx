// app/admin/statistik/akun/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';

export const revalidate = 0;

export default async function AdminStatistikAkunPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch (error) {} } } }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: akunData } = await supabase.from('permintaan_akun').select('status');

  const stats = {
    total: akunData?.length || 0,
    disetujui: akunData?.filter(a => a.status?.toLowerCase() === 'disetujui').length || 0,
    pending: akunData?.filter(a => a.status?.toLowerCase() === 'pending' || !a.status).length || 0,
    ditolak: akunData?.filter(a => a.status?.toLowerCase() === 'ditolak').length || 0,
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" /> Statistik Akun Dinas
          </h1>
          <p className="text-sm text-slate-500 font-medium">Rekapitulasi status permintaan registrasi akun koperasi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Permintaan</CardTitle><Users className="w-4 h-4 text-blue-600" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-500">Akun Disetujui</CardTitle><CheckCircle2 className="w-4 h-4 text-green-600" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.disetujui}</div></CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-500">Menunggu Review</CardTitle><Clock className="w-4 h-4 text-amber-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{stats.pending}</div></CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-500">Akun Ditolak</CardTitle><XCircle className="w-4 h-4 text-red-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.ditolak}</div></CardContent>
        </Card>
      </div>
    </div>
  );
}