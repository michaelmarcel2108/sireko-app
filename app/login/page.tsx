// app/login/page.tsx
import { loginKoperasi } from './actions';
import { Store, Lock, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function KoperasiLoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams.error;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col items-center space-y-2 text-center mb-2">
          <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-md shadow-emerald-200">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Portal Koperasi</h1>
          <p className="text-sm font-medium text-slate-500">Sistem Informasi Rekapan Koperasi Buleleng</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-100 bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Login Pengurus</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Masukkan email dan sandi Koperasi Anda untuk mengelola data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginKoperasi} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Koperasi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input name="email" type="email" placeholder="koperasi@email.com" className="pl-10 h-10 text-sm" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input name="password" type="password" placeholder="••••••••" className="pl-10 h-10 text-sm" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-10 mt-2">
                Masuk ke Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Link href="/admin/login" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
            Pegawai Dinas? Masuk lewat Portal Admin &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}