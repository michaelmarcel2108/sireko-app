// app/admin/data-koperasi/kesehatan/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminSearch from '@/components/AdminSearch';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminKesehatanPage({ searchParams }: PageProps) {
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
            // Abaikan batasan penulisan cookie di Server Component
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

  // 1. Ambil relasi nama koperasi global untuk pemetaan tampilan UI tabel
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

  // 2. Dapatkan kecocokan ID pengguna dari tabel keragaan jika ada kata kunci pencarian
  let matchingUserIds: string[] = [];
  if (searchQuery) {
    const { data: matchedKoperasi } = await supabase
      .from('keragaan_koperasi')
      .select('user_id')
      .or(`nama_koperasi.ilike.%${searchQuery}%,kecamatan.ilike.%${searchQuery}%`);
    
    if (matchedKoperasi) {
      matchingUserIds = matchedKoperasi
        .map(k => k.user_id)
        .filter((id): id is string => Boolean(id))
        .map(id => String(id).trim().toLowerCase());
    }
  }

  // 3. Eksekusi query utama ke tabel kesehatan_koperasi
  let dbQuery = supabase
    .from('kesehatan_koperasi')
    .select('*', { count: 'exact' })
    .order('tahun', { ascending: false });

  if (searchQuery) {
    if (matchingUserIds.length > 0) {
      // Format .in.(id1,id2) tanpa tanda petik ganda internal agar tidak error di PostgREST
      dbQuery = dbQuery.or(`predikat_kesehatan.ilike.%${searchQuery}%,user_id.in.(${matchingUserIds.join(',')})`);
    } else {
      dbQuery = dbQuery.ilike('predikat_kesehatan', `%${searchQuery}%`);
    }
  }

  const { data: kesehatanList, count } = await dbQuery.range(fromIndex, toIndex);
  
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const getBadgeColor = (predikat: string) => {
    switch (predikat) {
      case 'Sehat': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cukup Sehat': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Kurang Sehat': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Dalam Pengawasan': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" /> Data Kesehatan Koperasi
          </h1>
          <p className="text-sm text-slate-500 font-medium">Monitoring skor dan predikat kesehatan koperasi se-Kabupaten Buleleng.</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900">Daftar Nilai Kesehatan</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Total terdata: <span className="text-slate-700 font-bold">{totalCount}</span> laporan kesehatan
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
                  <TableHead className="font-bold text-slate-500 text-center">Tahun Uji</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Skor Kesehatan</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Predikat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kesehatanList && kesehatanList.length > 0 ? (
                  kesehatanList.map((item, index) => {
                    const cleanUserId = item.user_id ? String(item.user_id).trim().toLowerCase() : '';
                    const namaKoperasi = namaKoperasiMap.get(cleanUserId) || 'Koperasi Belum Input Keragaan';
                    return (
                      <TableRow key={item.id || index} className="hover:bg-slate-50/50 border-b border-slate-100">
                        <td className="text-center font-medium text-sm text-slate-500 py-3.5">{fromIndex + index + 1}</td>
                        <td className="font-bold text-sm text-slate-900 py-3.5">{namaKoperasi}</td>
                        <td className="text-sm font-semibold text-slate-600 text-center py-3.5">{item.tahun || '-'}</td>
                        <td className="text-sm font-extrabold text-slate-800 text-center py-3.5">{item.skor_kesehatan || 0}</td>
                        <td className="text-center py-3.5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeColor(item.predikat_kesehatan)}`}>
                            {item.predikat_kesehatan || 'Belum Dinilai'}
                          </span>
                        </td>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium">Data kesehatan tidak ditemukan.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Container Selalu Ditampilkan */}
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