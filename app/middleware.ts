// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const currentPath = request.nextUrl.pathname;

  // 1. JIKA BELUM LOGIN
  if (!user) {
    // Kalau mau masuk /admin, arahkan ke /admin/login
    if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    // Kalau mau masuk /koperasi, arahkan ke /login
    if (currentPath.startsWith('/koperasi')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // 2. JIKA SUDAH LOGIN
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const userRole = profile?.role || 'koperasi';

    // Koperasi nyasar ke area admin -> Tendang ke dashboard koperasi
    if (userRole === 'koperasi' && currentPath.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/koperasi/dashboard';
      return NextResponse.redirect(url);
    }

    // Admin nyasar ke area koperasi -> Tarik ke dashboard admin
    if (userRole === 'admin' && (currentPath.startsWith('/koperasi') || currentPath === '/login')) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    // Koperasi yang sudah login mau buka halaman login lagi -> Tarik ke dashboard koperasi
    if (userRole === 'koperasi' && currentPath === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/koperasi/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};