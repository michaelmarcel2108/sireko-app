// app/admin/sertifikat/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import AdminSearch from '@/components/AdminSearch';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminSertifikatPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Abaikan error di Server Component
          }
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const searchQuery = resolvedSearchParams.q || '';
  const currentPage = parseInt(resolvedSearchParams.page || '1') || 1;
  const itemsPerPage = 25;
  const fromIndex = (currentPage - 1) * itemsPerPage;
  const toIndex = fromIndex + itemsPerPage - 1;

  // 1. Ambil nama koperasi global untuk pemetaan
  const { data: listKeragaan } = await supabase
    .from('keragaan_koperasi')
    .select('user_id, nama_koperasi');

  const namaKoperasiMap = new Map();
  listKeragaan?.forEach(k => {
    if (k.user_id && k.nama_koperasi) {
      const key = String(k.user_id).trim().toLowerCase();
      namaKoperasiMap.set(key, k.nama_koperasi.trim());
    }
  });

  // 2. Filter ID jika pencarian menggunakan nama
  let matchingUserIds: string[] = [];
  if (searchQuery) {
    const { data: matchedKoperasi } = await supabase
      .from('keragaan_koperasi')
      .select('user_id')
      .or(`nama_koperasi.ilike.%${searchQuery}%`);
    
    if (matchedKoperasi) {
      matchingUserIds = matchedKoperasi
        .map(k => k.user_id)
        .filter((id): id is string => Boolean(id))
        .map(id => String(id).trim().toLowerCase());
    }
  }

  // 3. Bangun query ke tabel legalitas khusus untuk melihat status sertifikat
  let dbQuery = supabase
    .from('legalitas_koperasi')
    .select('*', { count: 'exact' })
    .order('sertifikat', { ascending: true }) // Yang belum bersertifikat bisa muncul di atas jika disesuaikan
    .order('created_at', { ascending: false });

  if (searchQuery) {
    if (matchingUserIds.length > 0) {
      dbQuery = dbQuery.or(`nik_koperasi.ilike.%${searchQuery}%,sertifikat.ilike.%${searchQuery}%,user_id.in.(${matchingUserIds.join(',')})`);
    } else {
      dbQuery = dbQuery.or(`nik_koperasi.ilike.%${searchQuery}%,sertifikat.ilike.%${searchQuery}%`);
    }
  }

  const { data: sertifikatList, count } = await dbQuery.range(fromIndex, toIndex);
  
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" /> Usulan Cetak Sertifikat
          </h1>
          <p className="text-sm text-slate-500 font-medium">Monitoring status kepemilikan dan kelayakan cetak Sertifikat NIK Koperasi.</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900">Daftar Status Sertifikat NIK</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Total terdata: <span className="text-slate-700 font-bold">{totalCount}</span> dokumen legalitas
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AdminSearch />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70">
                <TableRow className="border-b border-slate-100">
                  <TableHead className="w-[50px] font-bold text-slate-500 text-center">No</TableHead>
                  <TableHead className="font-bold text-slate-500">Nama Koperasi</TableHead>
                  <TableHead className="font-bold text-slate-500">NIK Koperasi</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Status NIK</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Status Sertifikat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sertifikatList && sertifikatList.length > 0 ? (
                  sertifikatList.map((item, index) => {
                    const cleanUserId = item.user_id ? String(item.user_id).trim().toLowerCase() : '';
                    const namaKoperasi = namaKoperasiMap.get(cleanUserId) || 'Koperasi Belum Input Keragaan';
                    
                    const isBersertifikat = item.sertifikat === 'Sudah Bersertifikat';
                    const hasNik = !!item.nik_koperasi && item.nik_koperasi.length > 3;

                    return (
                      <TableRow key={item.id || index} className="hover:bg-slate-50/50 border-b border-slate-100">
                        <td className="text-center font-medium text-sm text-slate-500 py-3.5">{fromIndex + index + 1}</td>
                        <td className="font-bold text-sm text-slate-900 py-3.5">{namaKoperasi}</td>
                        <td className="text-sm font-semibold text-slate-700 py-3.5">{item.nik_koperasi || '-'}</td>
                        <td className="text-center py-3.5">
                          {hasNik ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3" /> NIK Terbit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                              Belum Ada NIK
                            </span>
                          )}
                        </td>
                        <td className="text-center py-3.5">
                          {isBersertifikat ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                              <Award className="w-3 h-3" /> Dicetak
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              <XCircle className="w-3 h-3" /> Menunggu
                            </span>
                          )}
                        </td>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium">Data legalitas tidak ditemukan.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/40">
            <span className="text-xs font-semibold text-slate-500">
              Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari <span className="font-bold text-slate-800">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`?q=${searchQuery}&page=${Math.max(1, currentPage - 1)}`}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-bold transition-all shadow-sm ${
                  currentPage <= 1
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed pointer-events-none'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
              </Link>
              <Link
                href={`?q=${searchQuery}&page=${Math.min(totalPages, currentPage + 1)}`}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-bold transition-all shadow-sm ${
                  currentPage >= totalPages
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed pointer-events-none'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}