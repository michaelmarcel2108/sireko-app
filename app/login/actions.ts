// app/login/actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

// Helper untuk inisialisasi Supabase
async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } 
          catch (error) {}
        },
      },
    }
  );
}

// 1. ACTION: LOGIN KOPERASI
export async function loginKoperasi(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return redirect('/login?error=Email dan password wajib diisi');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return redirect(`/login?error=${encodeURIComponent(error.message)}`);

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
  
  // Jika Admin nyasar login di sini, tolak aksesnya
  if (profile?.role === 'admin') {
    await supabase.auth.signOut();
    return redirect('/login?error=Akun ini adalah akun Admin. Silakan login di Portal Admin.');
  }

  redirect('/koperasi/dashboard');
}

// 2. ACTION: LOGIN ADMIN
export async function loginAdmin(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return redirect('/admin/login?error=Email dan password wajib diisi');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);

  // --- CEK PROFIL DAN LOG DEBUG ---
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
  
  console.log("=== CEK DATA LOGIN ADMIN ===");
  console.log("User ID:", data.user.id);
  console.log("Data Profil yang ditarik:", profile);
  console.log("Pesan Error (jika ada):", profileError);
  console.log("============================");

  // Jika Koperasi (atau data null/kosong) nyasar login di sini, tolak aksesnya
  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    return redirect('/admin/login?error=Akses ditolak. Anda tidak memiliki hak akses Admin.');
  }

  redirect('/admin');
}