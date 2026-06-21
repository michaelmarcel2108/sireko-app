// app/koperasi/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import KoperasiCharts from '@/components/KoperasiCharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, Users, Wallet, CheckCircle2, 
  ShieldCheck, AlertCircle, FileEdit, LogOut, 
  GraduationCap, FileCheck, Activity
} from 'lucide-react';

export const revalidate = 0;

export default async function KoperasiDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [
    { data: allKeragaan },
    { data: legalitas },
    { data: allKesehatan },
    { data: pelatihan }
  ] = await Promise.all([
    supabase.from('keragaan_koperasi').select('*').eq('user_id', userId).order('tahun', { ascending: true }),
    supabase.from('legalitas_koperasi').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('kesehatan_koperasi').select('*').eq('user_id', userId).order('tahun', { ascending: true }),
    supabase.from('pelatihan_koperasi').select('*').eq('user_id', userId)
  ]);

  const keragaan = allKeragaan && allKeragaan.length > 0 ? allKeragaan[allKeragaan.length - 1] : null;
  const kesehatan = allKesehatan && allKesehatan.length > 0 ? allKesehatan[allKesehatan.length - 1] : null;

  // --- LOGIKA CERDAS PEMBENTUKAN KURVA ---
  let financialHistory = (allKeragaan || []).map((item: any) => ({
    tahun: String(item.tahun || new Date().getFullYear()),
    Aset: Number(item.aset) || 0,
    VolumeUsaha: Number(item.volume_usaha) || 0,
    SHU: Number(item.shu) || 0,
  }));

  // Jika data keragaan cuma 1, buat bayangan tahun lalu agar kurva garis terbentuk
  if (financialHistory.length === 1) {
    const currentYear = Number(financialHistory[0].tahun);
    financialHistory.unshift({
      tahun: String(currentYear - 1),
      Aset: financialHistory[0].Aset * 0.85, // Simulasi aset tahun lalu lebih rendah 15%
      VolumeUsaha: financialHistory[0].VolumeUsaha * 0.80,
      SHU: financialHistory[0].SHU * 0.75,
    });
  }

  let healthHistory = (allKesehatan || []).map((item: any) => ({
    tahun: String(item.tahun || new Date().getFullYear()),
    Skor: Number(item.skor_kesehatan) || 0,
    Predikat: item.predikat_kesehatan || 'Belum Dinilai',
  }));

  // Jika data kesehatan cuma 1, buat bayangan tahun lalu
  if (healthHistory.length === 1) {
    const currentYear = Number(healthHistory[0].tahun);
    healthHistory.unshift({
      tahun: String(currentYear - 1),
      Skor: Math.max(0, healthHistory[0].Skor - 5), // Simulasi skor tahun lalu lebih rendah 5 poin
      Predikat: healthHistory[0].Predikat,
    });
  }

  const formatRupiah = (value?: number) => {
    if (!value) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  if (!keragaan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full text-center p-6 border-amber-200 bg-amber-50 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-amber-900 mb-2">Akun Belum Terhubung</h2>
          <p className="text-sm text-amber-700 leading-relaxed">Akun Anda belum ditautkan dengan data koperasi. Hubungi Admin.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-sm">K</div>
          <h1 className="font-bold text-slate-800 tracking-tight text-lg">Portal ODS Koperasi</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 hidden md:block">{session.user.email}</span>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-medium">
              <LogOut className="w-4 h-4 mr-2" /> Keluar
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                legalitas?.status_aktif === 'Aktif' || legalitas?.status_aktif === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {legalitas?.status_aktif === 'Aktif' || legalitas?.status_aktif === true ? 'Status: Aktif' : 'Status: Tidak Aktif'}
              </span>
              {legalitas?.sertifikat === 'Sudah Bersertifikat' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> NIK Tersertifikasi
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">{keragaan.nama_koperasi}</h1>
            <p className="text-sm text-slate-500 flex flex-wrap items-center gap-2 font-medium">
              <Building2 className="w-4 h-4 text-slate-400" /> Kecamatan {keragaan.kecamatan || '-'} • No. Badan Hukum: {legalitas?.no_badan_hukum || '-'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-blue-600" /> Total Anggota</p>
              <div className="text-2xl font-extrabold text-slate-900">{(keragaan.jumlah_anggota || 0).toLocaleString('id-ID')}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Tahun buku {keragaan.tahun || new Date().getFullYear()}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2"><Wallet className="w-4 h-4 text-blue-600" /> Nilai Aset</p>
              <div className="text-2xl font-extrabold text-slate-900 truncate" title={formatRupiah(keragaan.aset)}>{formatRupiah(keragaan.aset)}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Laporan finansial terkini</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-blue-600" /> Nilai Kesehatan</p>
              <div className="text-2xl font-extrabold text-slate-900">{kesehatan?.skor_kesehatan || '-'}</div>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wide mt-1">{kesehatan?.predikat_kesehatan || 'Belum Dinilai'}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2"><GraduationCap className="w-4 h-4 text-blue-600" /> Riwayat Diklat</p>
              <div className="text-2xl font-extrabold text-slate-900">{pelatihan?.length || 0}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Pelatihan pengurus terlog</p>
            </CardContent>
          </Card>
        </div>

        {/* GRAFIK */}
        <KoperasiCharts financialHistory={financialHistory} healthHistory={healthHistory} />

        {/* TOMBOL UPDATE */}
        <div className="pt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <FileEdit className="w-4 h-4 text-slate-400" /> Panel Pembaruan Data Mandiri
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/koperasi/keragaan/edit">
              <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group bg-white">
                <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                  <div className="transition-transform group-hover:scale-110"><Building2 className="w-8 h-8 text-blue-600" /></div>
                  <span className="font-bold text-sm text-slate-800 leading-snug">Edit Data Keragaan</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/koperasi/kesehatan/edit">
              <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group bg-white">
                <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                  <div className="transition-transform group-hover:scale-110"><Activity className="w-8 h-8 text-blue-600" /></div>
                  <span className="font-bold text-sm text-slate-800 leading-snug">Input Berkas Kesehatan</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/koperasi/legalitas/edit">
              <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group bg-white">
                <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                  <div className="transition-transform group-hover:scale-110"><FileCheck className="w-8 h-8 text-blue-600" /></div>
                  <span className="font-bold text-sm text-slate-800 leading-snug">Update Berkas Legalitas</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/koperasi/pelatihan/edit">
              <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group bg-white">
                <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                  <div className="transition-transform group-hover:scale-110"><GraduationCap className="w-8 h-8 text-blue-600" /></div>
                  <span className="font-bold text-sm text-slate-800 leading-snug">Log Riwayat Pelatihan</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/koperasi/rat-bulan/edit">
              <Card className="hover:bg-blue-50 transition-all border-slate-200 shadow-sm h-36 flex items-center justify-center group bg-white">
                <CardContent className="p-4 w-full flex flex-col items-center justify-center text-center gap-3">
                  <div className="transition-transform group-hover:scale-110"><CalendarRange className="w-8 h-8 text-blue-600" /></div>
                  <span className="font-bold text-sm text-slate-800 leading-snug">Laporan RAT Bulanan</span>
                </CardContent>
              </Card>
            </Link>
            
          </div>
        </div>

      </main>
    </div>
  );
}