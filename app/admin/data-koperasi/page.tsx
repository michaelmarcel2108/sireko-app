// app/admin/data-koperasi/page.tsx
import Link from 'next/link';
import { 
  getKeragaanData, 
  getKesehatanData, 
  getPelatihanData, 
  getLegalitasData 
} from '@/utils/api-koperasi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'; // Pastikan lucide-react terinstal

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export const revalidate = 0; // Admin harus selalu melihat data paling realtime (tanpa cache)

export default async function AdminDataKoperasiPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || 'keragaan';

  const [keragaan, kesehatan, pelatihan, legalitas] = await Promise.all([
    getKeragaanData(),
    getKesehatanData(),
    getPelatihanData(),
    getLegalitasData(),
  ]);

  const tabs = [
    { id: 'keragaan', label: 'Keragaan', count: keragaan.length },
    { id: 'kesehatan', label: 'Kesehatan', count: kesehatan.length },
    { id: 'pelatihan', label: 'Pelatihan', count: pelatihan.length },
    { id: 'legalitas', label: 'Legalitas', count: legalitas.length },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Pusat Data</h1>
          <p className="text-muted-foreground mt-1">Kelola data keragaan, kesehatan, pelatihan, dan legalitas koperasi.</p>
        </div>
        
        {/* Tombol Tambah Dinamis Berdasarkan Tab */}
        <Link href={`/admin/data-koperasi/tambah?kategori=${activeTab}`}>
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Tambah Data {tabs.find(t => t.id === activeTab)?.label}
          </Button>
        </Link>
      </div>

      {/* Navigasi Tab Admin */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Link key={tab.id} href={`/admin/data-koperasi?tab=${tab.id}`}>
            <span className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}>
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-primary-foreground/20' : 'bg-background/50'}`}>
                {tab.count}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data {tabs.find(t => t.id === activeTab)?.label}</CardTitle>
          <CardDescription>Tabel ini menampilkan seluruh data yang saat ini aktif di database.</CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* TAB 1: KERAGAAN */}
          {activeTab === 'keragaan' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Koperasi</TableHead>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead className="text-right">Aset (Rp)</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keragaan.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama_koperasi}</TableCell>
                    <TableCell>{item.kecamatan || '-'}</TableCell>
                    <TableCell className="text-right">{Number(item.aset).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" title="Edit"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="destructive" size="icon" title="Hapus"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* TAB 2: KESEHATAN */}
          {activeTab === 'kesehatan' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Koperasi</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Predikat</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kesehatan.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama_koperasi}</TableCell>
                    <TableCell>{item.skor_kesehatan}</TableCell>
                    <TableCell>{item.predikat_kesehatan}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pelatihan.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama_koperasi}</TableCell>
                    <TableCell>{item.nama_pelatihan}</TableCell>
                    <TableCell>{item.tanggal_pelatihan}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* TAB 4: LEGALITAS */}
          {activeTab === 'legalitas' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Koperasi</TableHead>
                  <TableHead>Badan Hukum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {legalitas.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama_koperasi}</TableCell>
                    <TableCell>{item.no_badan_hukum || '-'}</TableCell>
                    <TableCell>{item.status_aktif}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

        </CardContent>
      </Card>
    </div>
  );
}