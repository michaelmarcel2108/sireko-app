// components/AdminSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function AdminSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  
  const [text, setText] = useState(currentQuery);

  // Menjaga sinkronisasi input text apabila URL berubah dari luar komponen
  useEffect(() => {
    setText(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    // Mencegah loop siklus render tak terbatas jika query teks bernilai sama dengan URL
    if (text === currentQuery) return;

    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (text) {
        params.set('q', text);
      } else {
        params.delete('q');
      }
      params.set('page', '1'); // Atur kembali ke halaman awal tiap kali mencari
      router.push(`?${params.toString()}`);
    }, 300); // Batasan waktu tunggu debounce 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [text, currentQuery, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        type="text"
        placeholder="Cari nama koperasi atau kecamatan..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="pl-9 bg-white border-slate-200"
      />
    </div>
  );
}