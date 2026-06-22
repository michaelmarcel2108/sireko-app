// app/admin/login/page.tsx
import { loginAdmin } from '@/app/login/actions';
import { ShieldAlert, Lock, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams.error;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header / Logo */}
        <div className="flex flex-col items-center space-y-2 text-center mb-2">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-md shadow-blue-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Portal Admin ODS</h1>
          <p className="text-sm font-medium text-slate-500">Dinas Koperasi Kab. Buleleng</p>
        </div>

        {/* Card Form */}
        <Card className="border-slate-200 shadow-xl shadow-slate-100 bg-white">
          <CardHeader className="space-y-1 pb-4 border-b border-slate-100">
            <CardTitle className="text-xl font-bold text-slate-900">Otorisasi Sistem</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Akses terbatas. Masukkan kredensial administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={loginAdmin} className="space-y-4">
              {/* Alert Error */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              
              {/* Input Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Admin</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    name="email" 
                    type="email" 
                    placeholder="admin@buleleng.go.id" 
                    className="pl-10 h-10 text-sm border-slate-200 bg-slate-50/50 focus:bg-white transition-all" 
                    required 
                  />
                </div>
              </div>
              
              {/* Input Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-10 text-sm border-slate-200 bg-slate-50/50 focus:bg-white transition-all" 
                    required 
                  />
                </div>
              </div>
              
              {/* Tombol Login */}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 mt-2 shadow-sm">
                Otorisasi Masuk
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Link Kembali */}
        <div className="text-center mt-4">
          <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">
            &larr; Kembali ke Login Koperasi
          </Link>
        </div>
      </div>
    </div>
  );
}