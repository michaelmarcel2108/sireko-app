import Link from 'next/link';
import { 
  getKeragaanData, 
  getKesehatanData, 
  getPelatihanData, 
  getLegalitasData 
} from '@/utils/api-koperasi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export const revalidate = 60; // Auto-refresh data tiap 1 menit

export default async function DataKoperasiPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || 'keragaan';

  const [keragaan, kesehatan, pelatihan, legalitas] = await Promise.all([
    getKeragaanData(),
    getKesehatanData(),
    getPelatihanData(),
    getLegalitasData(),
  ]);

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const tabs = [
    { id: 'keragaan', label: 'Keragaan Koperasi' },
    { id: 'kesehatan', label: 'Penilaian Kesehatan' },
    { id: 'pelatihan', label: 'Data Pelatihan' },
    { id: 'legalitas', label: 'Legalitas Usaha' },
  ];

  return (
    <div className="container mx-auto py-10 px-4 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Pusat Data Koperasi</h1>
        <p className="text-muted-foreground mt-2">Transparansi informasi dan perkembangan koperasi terkini.</p>
      </div>

      {/* Navigasi Tab */}
      <div className="flex justify-center space-x-2 md:space-x-4 mb-8 overflow-x-auto py-2">
        {tabs.map((tab) => (
          <Link key={tab.id} href={`/data-koperasi?tab=${tab.id}`}>
            <span className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}>
              {tab.label}
            </span>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {tabs.find(t => t.id === activeTab)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          
          {/* TAB 1: KERAGAAN */}
          {activeTab === 'keragaan' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Koperasi</TableHead>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead className="text-right">Anggota</TableHead>
                  <TableHead className="text-right">Aset</TableHead>
                  <TableHead className="text-right">Volume Usaha</TableHead>
                  <TableHead className="text-right">SHU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keragaan.length > 0 ? (
                  keragaan.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nama_koperasi}</TableCell>
                      <TableCell>{item.kecamatan || '-'}</TableCell>
                      <TableCell className="text-right">{item.jumlah_anggota || 0}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.aset)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.volume_usaha)}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">{formatCurrency(item.shu)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Data keragaan belum tersedia.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* TAB 2: KESEHATAN */}
          {activeTab === 'kesehatan' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Koperasi</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Predikat Kesehatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kesehatan.length > 0 ? (
                  kesehatan.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nama_koperasi}</TableCell>
                      <TableCell>{item.tahun || '-'}</TableCell>
                      <TableCell>{item.skor_kesehatan || '-'}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.predikat_kesehatan || 'Dalam Pengawasan'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Data kesehatan belum tersedia.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* TAB 3: PELATIHAN */}
          {activeTab === 'pelatihan' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Koperasi</TableHead>
                  <TableHead>Nama Pelatihan</TableHead>
                  <TableHead>Penyelenggara</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pelatihan.length > 0 ? (
                  pelatihan.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nama_koperasi}</TableCell>
                      <TableCell>{item.nama_pelatihan}</TableCell>
                      <TableCell>{item.penyelenggara || '-'}</TableCell>
                      <TableCell>{item.tanggal_pelatihan ? new Date(item.tanggal_pelatihan).toLocaleDateString('id-ID') : '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Data pelatihan belum tersedia.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* TAB 4: LEGALITAS */}
          {activeTab === 'legalitas' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Koperasi</TableHead>
                  <TableHead>No. Badan Hukum</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sertifikat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {legalitas.length > 0 ? (
                  legalitas.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nama_koperasi}</TableCell>
                      <TableCell>{item.no_badan_hukum || '-'}</TableCell>
                      <TableCell>{item.nik || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status_aktif === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status_aktif || 'Tidak Aktif'}
                        </span>
                      </TableCell>
                      <TableCell>
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.sertifikat === 'Sudah Bersertifikat' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.sertifikat || 'Belum Bersertifikat'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Data legalitas belum tersedia.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

        </CardContent>
      </Card>
    </div>
  );
}