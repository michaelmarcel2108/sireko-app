import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { error } = await supabase
    .from('periodes')
    .delete()
    .eq('id', resolvedParams.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}