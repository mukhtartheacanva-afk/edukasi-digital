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
    // Background utama dengan gradasi warna hutan/pohon hijau
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex items-center justify-center p-6 text-black font-sans relative overflow-hidden">
      
      {/* Ornamen dekorasi abstrak (efek daun/pohon) */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-green-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"></div>

      {/* Card Login dengan Tekstur Kayu Lembut (Soft Wood Appearance) */}
      <div className="max-w-md w-full bg-[#fdf8f1] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 border-8 border-[#e5d3b3] relative z-10">
        
        {/* Branding Section */}
        <div className="text-center mb-10">
          {/* Ikon diganti ke Pohon agar sesuai tema */}
          <div className="text-6xl mb-4 drop-shadow-md">🌳</div>
          <h1 className="text-4xl font-black tracking-tighter text-[#4a3728]">SI-DUGI</h1>
          <div className="h-1 w-20 bg-green-600 mx-auto rounded-full mt-1"></div>
          <p className="text-[#8b7355] font-medium mt-4">Akses materi & peraturan dengan nuansa tenang.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-[#8b7355] mb-2 ml-1 tracking-widest">Alamat Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-[#f3e9dc] rounded-2xl border-2 border-transparent focus:border-green-600 focus:bg-white outline-none font-bold transition-all placeholder:text-[#cbb493] text-[#4a3728]"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-[10px] font-black uppercase text-[#8b7355] tracking-widest">Password</label>
              <Link 
                href="/forgot-password" 
                className="text-[10px] font-black uppercase text-green-700 hover:text-green-900 transition-colors tracking-widest underline decoration-green-200"
              >
                Lupa?
              </Link>
            </div>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-[#f3e9dc] rounded-2xl border-2 border-transparent focus:border-green-600 focus:bg-white outline-none font-bold transition-all placeholder:text-[#cbb493] text-[#4a3728]"
              placeholder="••••••••"
            />
          </div>

          {/* Button dengan warna Hijau Daun (Forest Green) */}
          <button 
            disabled={loading}
            className="w-full py-4 bg-[#2d5a27] text-white rounded-2xl font-black shadow-lg shadow-green-900/30 hover:bg-[#1f3f1b] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'MENGECEK AKSES...' : 'MASUK KE HUTAN ILMU'}
          </button>
        </form>

        {/* Footer Section */}
        <div className="mt-10 pt-8 border-t border-[#e5d3b3] text-center">
          <p className="text-sm font-bold text-[#8b7355]">
            Belum terdaftar? 
            <Link href="/register" className="ml-2 text-green-700 hover:underline decoration-2 underline-offset-4">
              Daftar Gratis
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}