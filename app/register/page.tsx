 'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, 
        }
      }
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Pendaftaran Berhasil! Silakan cek email kamu untuk konfirmasi, lalu silakan Login.')
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    // Background gradasi hutan hijau (sama dengan Login)
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex items-center justify-center p-6 text-black font-sans relative overflow-hidden">
      
      {/* Ornamen daun/pohon abstrak */}
      <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-green-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>

      {/* Card dengan tekstur kayu (Soft Wood) */}
      <div className="max-w-md w-full bg-[#fdf8f1] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 border-8 border-[#e5d3b3] relative z-10">
        
        <div className="text-center mb-10">
          <div className="text-5xl mb-4 drop-shadow-sm">🌱</div>
          <h1 className="text-3xl font-black tracking-tighter text-[#4a3728]">DAFTAR BARU</h1>
          <div className="h-1 w-16 bg-green-600 mx-auto rounded-full mt-1"></div>
          <p className="text-[#8b7355] font-medium mt-4 italic text-sm">Mulai perjalananmu di Hutan Ilmu SI-DUGI.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-[#8b7355] mb-2 ml-1 tracking-widest">Nama Lengkap</label>
            <input 
              type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full p-4 bg-[#f3e9dc] rounded-2xl border-2 border-transparent focus:border-green-600 focus:bg-white outline-none font-bold transition-all placeholder:text-[#cbb493] text-[#4a3728]"
              placeholder="Joko Susilo"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-[#8b7355] mb-2 ml-1 tracking-widest">Alamat Email</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-[#f3e9dc] rounded-2xl border-2 border-transparent focus:border-green-600 focus:bg-white outline-none font-bold transition-all placeholder:text-[#cbb493] text-[#4a3728]"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-[#8b7355] mb-2 ml-1 tracking-widest">Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-[#f3e9dc] rounded-2xl border-2 border-transparent focus:border-green-600 focus:bg-white outline-none font-bold transition-all placeholder:text-[#cbb493] text-[#4a3728]"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-[#2d5a27] text-white rounded-2xl font-black shadow-lg shadow-green-900/30 hover:bg-[#1f3f1b] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-[#e5d3b3] text-center">
          <p className="text-sm font-bold text-[#8b7355]">
            Sudah punya akun? 
            <Link href="/login" className="ml-2 text-green-700 hover:underline decoration-2 underline-offset-4">
              Login di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}