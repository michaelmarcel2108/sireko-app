// components/AdminCsvActions.tsx
'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr'; // <-- Menggunakan @supabase/ssr
import { toast } from 'sonner';

interface CsvActionsProps {
  dataToExport: any[];
}

export default function AdminCsvActions({ dataToExport }: CsvActionsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // Inisialisasi Supabase Client untuk Client Component
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Logika Ekspor CSV
  const handleExport = () => {
    if (dataToExport.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['Nama Koperasi', 'Kecamatan', 'Tahun', 'Jumlah Anggota', 'Aset', 'Volume Usaha', 'SHU'];
    const rows = dataToExport.map(item => [
      `"${item.nama_koperasi || ''}"`,
      `"${item.kecamatan || ''}"`,
      item.tahun || '',
      item.jumlah_anggota || 0,
      item.aset || 0,
      item.volume_usaha || 0,
      item.shu || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `data_koperasi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data sukses diekspor ke CSV');
  };

  // 2. Logika Impor CSV
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(line => line.split(','));
        
        // Hapus baris pertama (header) dan baris kosong
        const dataLines = lines.slice(1).filter(line => line.length > 1 && line[0].trim() !== '');

        const payload = dataLines.map(line => ({
          nama_koperasi: line[0]?.replace(/"/g, '').trim(),
          kecamatan: line[1]?.replace(/"/g, '').trim(),
          tahun: parseInt(line[2]) || new Date().getFullYear(),
          jumlah_anggota: parseInt(line[3]) || 0,
          aset: parseFloat(line[4]) || 0,
          volume_usaha: parseFloat(line[5]) || 0,
          shu: parseFloat(line[6]) || 0,
        }));

        if (payload.length === 0) throw new Error('Format berkas CSV kosong atau tidak valid.');

        // Insert data masal ke tabel keragaan_koperasi
        const { error } = await supabase.from('keragaan_koperasi').insert(payload);
        if (error) throw error;

        toast.success(`Berhasil mengimpor ${payload.length} data koperasi!`);
        router.refresh(); // Segarkan data server component
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Gagal memproses file CSV. Periksa kembali strukturnya.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-2">
      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        onChange={handleImport} 
        className="hidden" 
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => fileInputRef.current?.click()} 
        disabled={isImporting}
        className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
      >
        {isImporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengimpor...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2 text-blue-600" /> Impor CSV
          </>
        )}
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExport}
        className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
      >
        <Download className="w-4 h-4 mr-2 text-green-600" /> Ekspor CSV
      </Button>
    </div>
  );
}