// app/admin/akun/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Users, ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react';
import AdminSearch from '@/components/AdminSearch';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminPermintaanAkunPage({ searchParams }: PageProps) {
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

  // Query ke tabel permintaan_akun (sesuaikan dengan nama tabel registrasi/akun Anda)
  let dbQuery = supabase
    .from('permintaan_akun')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (searchQuery) {
    dbQuery = dbQuery.or(`nama_koperasi.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,status.ilike.%${searchQuery}%`);
  }

  const { data: akunRequests, count } = await dbQuery.range(fromIndex, toIndex);
  
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'disetujui':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800">Disetujui</span>;
      case 'ditolak':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Permintaan Akun Koperasi
          </h1>
          <p className="text-sm text-slate-500 font-medium">Verifikasi dan manajemen pendaftaran akun koperasi baru.</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900">Daftar Permintaan Akun</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Total pendaftaran: <span className="text-slate-700 font-bold">{totalCount}</span> usulan akun
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
                  <TableHead className="font-bold text-slate-500">Email Pendaftar</TableHead>
                  <TableHead className="font-bold text-slate-500">No. HP / Kontak</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Tanggal Daftar</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Status</TableHead>
                  <TableHead className="font-bold text-slate-500 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {akunRequests && akunRequests.length > 0 ? (
                  akunRequests.map((item, index) => (
                    <TableRow key={item.id || index} className="hover:bg-slate-50/50 border-b border-slate-100">
                      <td className="text-center font-medium text-sm text-slate-500 py-3.5">{fromIndex + index + 1}</td>
                      <td className="font-bold text-sm text-slate-900 py-3.5">{item.nama_koperasi}</td>
                      <td className="text-sm font-semibold text-slate-600 py-3.5">{item.email || '-'}</td>
                      <td className="text-sm font-medium text-slate-600 py-3.5">{item.no_hp || '-'}</td>
                      <td className="text-sm font-medium text-slate-500 text-center py-3.5">{formatDate(item.created_at)}</td>
                      <td className="text-center py-3.5">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="text-center py-3.5">
                        {item.status?.toLowerCase() === 'pending' || !item.status ? (
                          <div className="flex justify-center gap-1.5">
                            <Button variant="outline" size="icon" className="h-7 w-7 text-green-600 border-green-200 hover:bg-green-50" title="Setujui">
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-7 w-7 text-red-600 border-red-200 hover:bg-red-50" title="Tolak">
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">-</span>
                        )}
                      </td>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium">Belum ada permintaan pembuatan akun baru.</TableCell>
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
                  currentPage <= 1 ? 'bg-slate-100 text-slate-400 pointer-events-none' : 'bg-white hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
              </Link>
              <Link
                href={`?q=${searchQuery}&page=${Math.min(totalPages, currentPage + 1)}`}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-bold transition-all shadow-sm ${
                  currentPage >= totalPages ? 'bg-slate-100 text-slate-400 pointer-events-none' : 'bg-white hover:bg-slate-50'
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