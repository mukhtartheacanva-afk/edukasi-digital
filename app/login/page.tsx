 'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert("Gagal Login: " + error.message)
    } else {
      router.push('/materi')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-black font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100">
        
        {/* Branding Section */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4 animate-bounce">🚀</div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900">MASUK</h1>
          <p className="text-gray-400 font-medium mt-2">Akses katalog materi dan peraturan.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Alamat Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold transition-all placeholder:text-gray-300"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Password</label>
              <Link 
                href="/forgot-password" 
                className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors tracking-widest"
              >
                Lupa Password?
              </Link>
            </div>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold transition-all placeholder:text-gray-300"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'MENGECEK AKSES...' : 'MASUK SEKARANG'}
          </button>
        </form>

        {/* Footer Section (Register Link) */}
        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <p className="text-sm font-bold text-gray-400">
            Belum terdaftar? 
            <Link href="/register" className="ml-2 text-blue-600 hover:underline decoration-2 underline-offset-4">
              Buat Akun Gratis
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}