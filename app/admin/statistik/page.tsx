// app/admin/statistik/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Building2, TrendingUp } from 'lucide-react';

export const revalidate = 0;

export default async function AdminStatistikPage() {
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

  // Mengambil data ringkasan untuk statistik
  const { data: keragaan } = await supabase.from('keragaan_koperasi').select('jumlah_anggota, aset, shu');
  
  const stats = keragaan?.reduce((acc, curr) => ({
    totalAnggota: acc.totalAnggota + (curr.jumlah_anggota || 0),
    totalAset: acc.totalAset + (curr.aset || 0),
    totalSHU: acc.totalSHU + (curr.shu || 0),
    count: acc.count + 1
  }), { totalAnggota: 0, totalAset: 0, totalSHU: 0, count: 0 });

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-extrabold text-slate-950 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-600" /> Ringkasan Statistik Nasional
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Anggota</CardTitle><Users className="w-4 h-4 text-blue-600" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalAnggota.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Aset</CardTitle><Building2 className="w-4 h-4 text-blue-600" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatRupiah(stats?.totalAset || 0)}</div></CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total SHU</CardTitle><TrendingUp className="w-4 h-4 text-blue-600" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatRupiah(stats?.totalSHU || 0)}</div></CardContent>
        </Card>
      </div>
    </div>
  );
}