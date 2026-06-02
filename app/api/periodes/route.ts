import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('periodes')
    .select('*')
    .order('tahun', { ascending: false })
    .order('id', { ascending: false }); // Urutkan dari yang terbaru

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bulan, tahun, keterangan } = body;

    const { data, error } = await supabase
      .from('periodes')
      .insert([{
        bulan,
        tahun: parseInt(tahun),
        keterangan,
      }])
      .select();

    if (error) throw error;
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    // ⬇️ TAMBAHKAN BARIS INI DI SINI ⬇️
    console.error("DETAIL ERROR SUPABASE:", error);
    
    return NextResponse.json({ message: "Gagal menambahkan periode baru", error: error.message }, { status: 500 });
  }
}